var output = new Image(),
    preview = new Image();

let s;
let name;
let file;

document.getElementById("imageFile").onchange = (event) => {
    file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = () => {
        preview.src = reader.result;

        document.getElementById("width").value = preview.width;
        document.getElementById("height").value = preview.height;
    };

    reader.readAsDataURL(file);
}

function resize() {
    let ratio = parseInt(preview.height) / parseInt(preview.width);
    document.getElementById("height").value = parseInt(document.getElementById("width").value * ratio);
}

document.getElementById("mainButton").onclick = () => {
    if (!file)
        return;

    document.getElementById("loading").style.display = "block";

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

            console.log(w, h);

            canvas.getContext('2d').drawImage(output, 0, 0, w, h);

            name = file.name.substring(0, file.name.length - 4).replaceAll(" ", "_").replaceAll("-", "_").replaceAll(".", "_");

            s = `const uint8_t ${name}[] PROGMEM = {\n`;

            if (document.getElementById("dither").checked)
                dither(canvas, document.getElementById("3bit").checked ? 3 : 1);

            document.getElementById("preview").getContext('2d').drawImage(canvas, 0, 0, parseInt(preview.width) / parseInt(preview.height) * document.getElementById("preview").height, document.getElementById("preview").height);

            let last = 0;

            if (document.getElementById("3bit").checked) {
                for (let i = 0; i < h; ++i) {
                    for (let j = 0; j < w; ++j) {
                        let pixels = canvas.getContext('2d').getImageData(j, i, 1, 1).data;

                        let val = pixels[0];

                        if (j % 2 == 0)
                            last = val & 0xF0;
                        else {
                            last |= (val >> 4) & 0x0F;

                            s += `0x${last.toString(16)},`;
                            last = 0;
                        }
                    }
                    if (h % 2 != 0) {
                        s += `0x${last.toString(16)},`;
                        last = 0;
                    }
                    s += "\n";
                }
                s += `};\n`;
            } else {
                for (let i = 0; i < h; ++i) {
                    for (let j = 0; j < w; ++j) {
                        let pixels = canvas.getContext('2d').getImageData(j, i, 1, 1).data;

                        let val = (pixels[0] >> 7) & 1;

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
                }
                s += `};\n`;
            }
            finished = 1;

            download(name + ".h", s + `int ${name}_w = ${w};\nint ${name}_h = ${h};\n`);

            document.getElementById("loading").style.display = "none";

        }
        reader.readAsDataURL(file);
    }, 0);
};

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
    let ctx = canvas.getContext('2d');

    let id = ctx.createImageData(1, 1);
    let d = id.data;
    d[3] = 255;

    for (let i = 1; i < parseInt(document.getElementById("height").value) - 1; ++i) {
        for (let j = 1; j < parseInt(document.getElementById("width").value) - 1; ++j) {
            let pixels = ctx.getImageData(j, i, 1, 1).data;

            let oldpixel = pixels[0];
            let newpixel = oldpixel & (depth == 3 ? 0xE0 : 0x80);

            d[0] = newpixel;
            ctx.putImageData(id, j, i);

            let quant_error = oldpixel - newpixel;

            d[0] = ctx.getImageData(j + 1, i, 1, 1).data[0] + Math.floor(quant_error * 7 / 16);
            ctx.putImageData(id, j + 1, i);

            d[0] = ctx.getImageData(j - 1, i + 1, 1, 1).data[0] + Math.floor(quant_error * 3 / 16);
            ctx.putImageData(id, j - 1, i + 1);

            d[0] = ctx.getImageData(j, i + 1, 1, 1).data[0] + Math.floor(quant_error * 5 / 16);
            ctx.putImageData(id, j, i + 1);

            d[0] = ctx.getImageData(j + 1, i + 1, 1, 1).data[0] + Math.floor(quant_error * 1 / 16);
            ctx.putImageData(id, j + 1, i + 1);

        }
    }
}