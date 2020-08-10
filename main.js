var output = new Image();

let s1;
let s2;
let name;

let file;

document.getElementById("imageFile").onchange = (event) => {
    file = event.target.files[0];
}

document.getElementById("mainButton").onclick = () => {
    if (!file)
        return;
    var reader = new FileReader();
    reader.onload = () => {
        output.src = reader.result;

        var canvas = document.createElement('canvas');
        canvas.width = output.width;
        canvas.height = output.height;

        canvas.getContext('2d').drawImage(output, 0, 0, output.width, output.height);

        name = file.name.substring(0, file.name.length - 4).replaceAll(" ", "_").replaceAll("-", "_").replaceAll(".", "_");

        s1 = `const uint8_t ${name}[] PROGMEM = {\n`;
        s2 = `const uint8_t ${name}[] PROGMEM = {\n`;

        let last = 0;

        for (let i = 0; i < output.height; ++i) {
            for (let j = 0; j < output.width; ++j) {
                let pixels = canvas.getContext('2d').getImageData(j, i, 1, 1).data;

                let val = parseInt(pixels[0] * .299 + pixels[1] * .587 + pixels[2] * .114);

                if (last == 0)
                    last = val & 0xF0;
                else {
                    last |= (val >> 4) & 0x0F;

                    s1 += `0x${last.toString(16)},`;
                    last = 0;
                }
            }
        }
        if (last != 0)
            s1 += `0x${last.toString(16)},`;
        s1 += `};\n`;

        for (let i = 0; i < output.height; ++i) {
            for (let j = 0; j < output.width; ++j) {
                let pixels = canvas.getContext('2d').getImageData(j, i, 1, 1).data;

                let val = (parseInt(pixels[0] * .299 + pixels[1] * .587 + pixels[2] * .114) >> 7) & 1;
                let cnt = 7 - (i * (output.width + 8 - output.width % 8) + j) % 8;

                last |= val << cnt;

                if (cnt == 0) {
                    s2 += `0x${last.toString(16)},`;
                    last = 0;
                }
            }
            if (output.width % 8 != 0) {
                s2 += `0x${last.toString(16)},`;
                last = 0;
            }
        }

        s2 += `};\n`;

        finished = 1;

        if (document.getElementById("include").checked)
            download(name + ".h", (document.getElementById("1bit").checked ?
                s2 + `int ${name}_w = ${output.width};\nint ${name}_h = ${output.height};\n` :
                s1 + `int ${name}_w = ${output.width};\nint ${name}_h = ${output.height};\n`));
        else
            download(name + ".h", (document.getElementById("1bit").checked ?
                s2 :
                s1));
    }
    reader.readAsDataURL(file);

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