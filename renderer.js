// Create mapping from original file name to new file name.
const CREATE_MAPPING = true;

/// CODE
const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron/renderer");
const { execSync } = require("child_process");

// Get elements
const dCurrent = document.querySelector(".current");
const dLoading = document.querySelector(".loading");

const dPrevBtn = document.querySelector(".prev_btn");
const dNextBtn = document.querySelector(".next_btn");
const dPlayBtn = document.querySelector(".play_btn");
const dSaveBtn = document.querySelector(".save_btn");
const dAppendBtn = document.querySelector(".append_btn");
const dJumpBtn = document.querySelector(".jump_btn");

// Setup
if (!fs.existsSync("./out")) fs.mkdirSync("./out");

const files = fs.readdirSync("./in", { recursive: true }).filter((filepath) => {
    // Remove directories, so we only have files
    // NOTE: Only looks for WAVs and MP3s
    return (
        !fs.statSync(`./in/${filepath}`).isDirectory() &&
        (filepath.endsWith(".wav") || filepath.endsWith(".mp3"))
    );
});

// Stop loading
dLoading.remove();

// Select starting point
let currFileIndex = 0;
dCurrent.textContent = files[currFileIndex].toString();

const jumpTo = () => {
    ipcRenderer
        .invoke("dialog:openFile", "Select starting point file")
        .then((outPath) => {
            currFileIndex = files.indexOf(
                path.relative(path.join(__dirname, "in"), outPath)
            );

            if (currFileIndex < 0) {
                alert("File not found. Starting from first file in /in");
                return;
            }

            dCurrent.textContent = files[currFileIndex].toString();
        });
};

jumpTo();

// Controls
dPrevBtn.addEventListener("click", () => {
    if (currFileIndex > 0) {
        currFileIndex--;
        dCurrent.textContent = files[currFileIndex].toString();
    } else {
        alert("No more previous files.");
    }
});

dNextBtn.addEventListener("click", () => {
    if (currFileIndex < files.length) {
        currFileIndex++;
        dCurrent.textContent = files[currFileIndex].toString();
    } else {
        alert("No more next files");
    }
});

dPlayBtn.addEventListener("click", () => {
    const audio = new Audio(`./in/${files[currFileIndex].toString()}`);
    audio.play();
});

dSaveBtn.addEventListener("click", async () => {
    const outPath = await ipcRenderer.invoke(
        "dialog:saveFile",
        "Save As",
        path.basename(files[currFileIndex].toString())
    );
    if (!outPath) return;

    // Re-encode, so Ren'Py accepts it lmao
    execSync(
        `ffmpeg -i "./in/${files[
            currFileIndex
        ].toString()}" -filter_complex "[0:0]concat=n=1:v=0:a=1[out]" -map "[out]" ${outPath} -y`
    );

    if (CREATE_MAPPING) {
        fs.appendFileSync(
            "./out/mapping.txt",
            `${files[currFileIndex].toString()}: ${outPath}\n`
        );
    }
});

dAppendBtn.addEventListener("click", async () => {
    const outPath = await ipcRenderer.invoke(
        "dialog:saveFile",
        "Select file to append to",
        path.basename(files[currFileIndex].toString())
    );
    if (!outPath) return;

    fs.renameSync(outPath, `${outPath}_TMP`);
    execSync(
        `ffmpeg  -i "${outPath}_TMP" -i "./in/${files[
            currFileIndex
        ].toString()}" -filter_complex "[0:0][1:0]concat=n=2:v=0:a=1[out]" -map "[out]" ${outPath} -y`
    );
    fs.rmSync(`${outPath}_TMP`);
});

dJumpBtn.addEventListener("click", () => {
    jumpTo();
});

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key == "a") {
        dPrevBtn.click();
    } else if (e.key === "ArrowRight" || e.key == "d") {
        dNextBtn.click();
    } else if (e.key === " ") {
        dPlayBtn.click();
    } else if (e.key === "s" && e.ctrlKey) {
        dSaveBtn.click();
    } else if (e.key === "v" && e.ctrlKey) {
        dAppendBtn.click();
    }
});
