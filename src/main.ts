import {webusb} from "usb";
import {config} from "dotenv";
import express from "express";
import bodyParser from "body-parser";

config();

const [VID, PID] = (process.env.PRINTER_VIDPID ?? "0000:0000").split(":").map(item => parseInt(item, 16));
const PORT = parseInt(process.env.PORT ?? "3000");

const app = express();

app.use(bodyParser.raw({
    type: "text/tspl"
}));

app.post("/tspl", (req, res) => {
    (async () => {
        const device = await webusb.requestDevice({
            filters: [{
                vendorId: VID,
                productId: PID
            }]
        });
        try {
            await device.transferOut(1, req.body);
        } finally {
            await device.close();
        }
        res.json({
            success: true
        });
    })().catch(e => {
        res.json({
            success: false,
            message: e.message
        });
    });
});

app.listen(PORT, () => console.info(`Started on :${PORT}`))