var output = new Image(),
    preview = new Image();

let s;
let name;
let file;

let result;

document.getElementById("imageFile").onchange = (event) => {
    file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = () => {
        preview.src = reader.result;

        preview.onload = function () {
            if (!document.getElementById("width").value) {
                document.getElementById("width").value = preview.width;
                document.getElementById("height").value = preview.height;
            } else {
                document.getElementById("height").value = parseInt(document.getElementById("width").value) * preview.height / preview.width;
            }
        }
    }

    reader.readAsDataURL(file);
}

function setPreset(a) {
    if (a == 0) {
        document.getElementById("3bit").checked = true;
        document.getElementById("dither").checked = true;
        document.getElementById("kernels").value = "FloydSteinberg";
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(800 * ratio);
        }
        document.getElementById("width").value = 800;
    } else if (a == 1) {
        document.getElementById("3bit").checked = true;
        document.getElementById("dither").checked = true;
        document.getElementById("kernels").value = "FloydSteinberg";
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(1200 * ratio);
        }
        document.getElementById("width").value = 1200;
    } else if (a == 2) {
        document.getElementById("3bit").checked = true;
        document.getElementById("dither").checked = true;
        document.getElementById("kernels").value = "FloydSteinberg";
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(800 * ratio);
        }
        document.getElementById("width").value = 800;
    } else if (a == 4) {
        document.getElementById("color").checked = true;
        document.getElementById("dither").checked = false;
        document.getElementById("kernels").value = "FloydSteinberg";
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(600 * ratio);
        }
        document.getElementById("width").value = 600;
    } else if (a == 3) {
        document.getElementById("3bit").checked = true;
        document.getElementById("dither").checked = true;
        document.getElementById("kernels").value = "FloydSteinberg";
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(1024 * ratio);
        }
        document.getElementById("width").value = 1024;
    } else if (a == 5) {
        document.getElementById("rb").checked = true;
        document.getElementById("toResize").checked = true;
        if (
            document.getElementById("width").value &&
            document.getElementById("height").value
        ) {
            let ratio =
                document.getElementById("height").value /
                document.getElementById("width").value;
            document.getElementById("height").value = parseInt(104 * ratio);
        }
        document.getElementById("width").value = 104;
    }
}

function checkResize() {
    document.getElementById("width").disabled = !document.getElementById("toResize").checked;
}

function resize() {
    let ratio = parseInt(preview.height) / parseInt(preview.width);
    document.getElementById("height").value = parseInt(document.getElementById("width").value * ratio);
}

function checkDither() {
    document.getElementById("kernels").disabled = !document.getElementById("dither").checked;
}

document.getElementById("mainButton").onclick = () => {
    if (!file)
        return;

    setTimeout(() => {
        var reader = new FileReader();
        reader.onload = () => {
            output.src = reader.result;

            var canvas = document.createElement('canvas');

            let h = parseInt(document.getElementById("height").value);
            let w = parseInt(document.getElementById("width").value);

            output.width = w;
            output.height = h;

            canvas.width = w;
            canvas.height = h;

            output.style.filter = "grayscale(100%)"; //I hope this works

            // console.log(w, h);

            canvas.getContext('2d').fillStyle = "#FFFFFF";
            canvas.getContext('2d').fillRect(0, 0, w, h);

            canvas.getContext('2d').drawImage(output, 0, 0, w, h);

            fname = file.name.substring(0, file.name.length - 4).replaceAll(" ", "_").replaceAll("-", "_").replaceAll(".", "_");

            s = `const uint8_t ${fname}[] PROGMEM = {\n`;

            if (document.getElementById("dither").checked || document.getElementById("color").checked)
                dither(canvas, document.getElementById("3bit").checked ? 3 : 1);

            document.getElementById("preview").getContext('2d').drawImage(canvas, 0, 0, parseInt(preview.width) / parseInt(preview.height) * document.getElementById("preview").height, document.getElementById("preview").height);

            let last = 0;
            let pixels = canvas.getContext('2d').getImageData(0, 0, w, h).data;
            if (document.getElementById("3bit").checked) {
                for (let i = 0; i < h; ++i) {
                    for (let j = 0; j < w; ++j) {
                        let val = pixels[4 * (j + i * w)];

                        if (document.getElementById("inv").checked)
                            val = 255 - val;

                        if (j % 2 == 0)
                            last = val & 0xF0;
                        else {
                            last |= (val >> 4) & 0x0F;

                            s += `0x${last.toString(16)},`;
                            last = 0;
                        }
                    }
                    if (w % 2 != 0) {
                        s += `0x${last.toString(16)},`;
                        last = 0;
                    }
                    s += "\n";
                }
                s += `};\n`;
            } else if (document.getElementById("1bit").checked) {
                for (let i = 0; i < h; ++i) {
                    for (let j = 0; j < w; ++j) {
                        let val = (pixels[4 * (j + i * w)] >> 7) & 1;

                        if (document.getElementById("inv").checked)
                            val = !val;

                        let cnt = 7 - j % 8;

                        last |= val << cnt;

                        if (cnt == 0) {
                            s += `0x${last.toString(16)},`;
                            last = 0;
                        }
                    }
                    if (w % 8 != 0) {
                        s += `0x${last.toString(16)},`;
                        last = 0;
                    }
                    s += "\n";
                }
                s += `};\n`;
            } else if (document.getElementById("color").checked) {
                for (let i = 0; i < h; ++i) {
                    for (let j = 0; j < w; ++j) {
                        let r = pixels[4 * (j + i * w)];
                        let g = pixels[4 * (j + i * w) + 1];
                        let b = pixels[4 * (j + i * w) + 2];

                        // [0, 0, 0],
                        // [255, 255, 255],
                        // [0, 255, 0],
                        // [0, 0, 255],
                        // [255, 0, 0],
                        // [255, 255, 0],
                        // [255, 128, 0]

                        let palette = [0x000000,
                            0xFFFFFF,
                            0x00FF00,
                            0x0000FF,
                            0xFF0000,
                            0xFFFF00,
                            0xFF8000];

                        let val = palette.indexOf((r << 16) | (g << 8) | b);
                        // console.log(val, r, g, b)


                        if (val == -1)
                            console.log((r << 16) | (g << 8) | b)

                        val <<= 5;

                        if (j % 2 == 0)
                            last = val & 0xF0;
                        else {
                            last |= (val >> 4) & 0x0F;

                            s += `0x${last.toString(16)},`;
                            last = 0;
                        }
                    }
                    if (w % 2 != 0) {
                        s += `0x${last.toString(16)},`;
                        last = 0;
                    }
                    s += "\n";
                }
                s += `};\n`;
            } else if (document.getElementById("rb").checked) {
                for (let i = 0; i < h; ++i) {
                    let last = 0;
                    for (let j = 0; j < w; ++j) {
                        let r = pixels[4 * (j + i * w)];
                        let g = pixels[4 * (j + i * w) + 1];
                        let b = pixels[4 * (j + i * w) + 2];

                        let palette = [0xFFFFFF, 0x000000, 0xFF0000];

                        let val = palette.indexOf((r << 16) | (g << 8) | b);

                        let red_dist = (r - 255) * (r - 255) + g * g + b * b;
                        let black_dist = r * r + g * g + b * b;
                        let white_dist = (r - 255) * (r - 255) + (g - 255) * (g - 255) + (b - 255) * (b - 255);

                        if (red_dist < black_dist && red_dist < white_dist)
                            val = 2;
                        else if (black_dist < white_dist)
                            val = 1;
                        else
                            val = 0;
                        

                        if (j % 4 == 0)
                            last = val << 6;
                        else if (j % 4 == 1)
                            last |= val << 4;
                        else if (j % 4 == 2)
                            last |= val << 2;
                        else if (j % 4 == 3) {
                            last |= val;

                            s += `0x${last.toString(16)},`;
                            last = 0;
                        }


                    }
                    if (w % 4 != 0) {
                        s += `0x${last.toString(16)},`;
                        last = 0;
                    }
                    s += "\n";
                }
                s += `};\n`;
            }


            finished = 1;

            result = {
                name: fname + ".h",
                raw: s + `int ${fname}_w = ${w};\nint ${fname}_h = ${h};\n`
            }

            document.getElementById("downloadButton").disabled = false;
            document.getElementById("textOutput").value = result.raw;

        }
        reader.readAsDataURL(file);
    }, 0);
};

function downloadHandler() {
    download(result.name, result.raw);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function dither(canvas, depth) {
    let h = parseInt(document.getElementById("height").value);
    let w = parseInt(document.getElementById("width").value);

    var pallete = [];
    if (document.getElementById("1bit").checked) {
        pallete = [
            [0, 0, 0],
            [255, 255, 255]
        ];
    } else if (document.getElementById("3bit").checked) {
        pallete = [
            [0, 0, 0],
            [32, 32, 32],
            [96, 96, 96],
            [128, 128, 128],
            [160, 160, 160],
            [192, 192, 192],
            [224, 224, 224],
        ];
    } else if (document.getElementById("color").checked) {
        pallete = [
            [0, 0, 0],
            [255, 255, 255],
            [0, 255, 0],
            [0, 0, 255],
            [255, 0, 0],
            [255, 255, 0],
            [255, 128, 0],
        ];
    } else if (document.getElementById("rb").checked) {
        pallete = [
            [0, 0, 0],
            [255, 0, 0],
            [255, 255, 255],
        ];
    }

    var opts = {
        colors: pallete.length,
        dithKern: document.getElementById("kernels").value,
        dithDelta: 0,
        palette: pallete,
        dithDelta: document.getElementById("dither").checked ? 0 : 1,
    };

    var q = new RgbQuant(opts);

    if (document.getElementById("inv").checked && document.getElementById("color").checked) {
        let dataArr = canvas.getContext("2d").getImageData(0, 0, w, h).data;
        for (var i = 0; i < dataArr.length; i += 4) {
            var r = dataArr[i]; // Red color lies between 0 and 255
            var g = dataArr[i + 1]; // Green color lies between 0 and 255
            var b = dataArr[i + 2]; // Blue color lies between 0 and 255
            var a = dataArr[i + 3]; // Transparency lies between 0 and 255

            var invertedRed = 255 - r;
            var invertedGreen = 255 - g;
            var invertedBlue = 255 - b;

            dataArr[i] = invertedRed;
            dataArr[i + 1] = invertedGreen;
            dataArr[i + 2] = invertedBlue;
        }
        var imgd = canvas.getContext("2d").createImageData(w, h);
        var data = imgd.data;
        for (var i = 0, len = data.length; i < len; ++i)
            data[i] = dataArr[i];
        canvas.getContext("2d").putImageData(imgd, 0, 0);
    }
    var out = q.reduce(canvas.getContext("2d").getImageData(0, 0, w, h));

    var imgd = canvas.getContext("2d").createImageData(w, h);
    var data = imgd.data;
    for (var i = 0, len = data.length; i < len; ++i)
        data[i] = out[i];

    // let c = document.createElement('canvas');
    // c.id = "a"
    // c.width = w;
    // c.height = h;
    // c.getContext("2d").putImageData(imgd, 0, 0);
    // document.body.appendChild(c);

    canvas.getContext("2d").putImageData(imgd, 0, 0);
}