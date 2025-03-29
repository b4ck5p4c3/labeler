from http.server import BaseHTTPRequestHandler, HTTPServer
import usb.core
import usb.util
import sys

PORT = 80
VID = 0x1fc9
PID = 0x2016

def send_code(handler, code, data):
    handler.send_response(code)
    handler.send_header("content-type", "text/plain")
    handler.end_headers()
    handler.wfile.write(data)

class HTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if not self.path.endswith("/tspl"):
            send_code(self, 404, b"")
            return
        if self.headers.get("content-type") != "application/tspl":
            send_code(self, 405, b"")
            return
        try:
            content_length = int(self.headers.get("content-length", 0))
            post_body = self.rfile.read(content_length)

            usb_device = usb.core.find(idVendor=VID, idProduct=PID)
            if usb_device is None:
                raise ValueError("usb device not found")

            if usb_device.is_kernel_driver_active(0):
                usb_device.detach_kernel_driver(0)

            usb_device.set_configuration()
            usb.util.claim_interface(usb_device, 0)
            try:
                usb_device.write(1, post_body)
            finally:
                usb.util.release_interface(usb_device, 0)

            send_code(self, 200, b"")
        except Exception as e:
            print(e, file=sys.stderr)
            send_code(self, 500, str(e).encode("utf-8"))

httpd = HTTPServer(('', PORT), HTTPRequestHandler)
httpd.serve_forever()