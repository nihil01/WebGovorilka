const { join } = require("path");
const fs = require('fs');
const path = join(process.cwd(), "avatars", "avatar_1.webp");

fs.open(path, "r", (err, fd) => {
    if (err) {
        console.error(err);
    } else {
        fs.readFile(fd, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(Buffer.from(data));
                fs.close(fd, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('File closed successfully.');
                    }
                });
            }
        });
    }
});

