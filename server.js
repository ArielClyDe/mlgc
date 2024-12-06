const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Joi = require('@hapi/joi');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 1000000 } }); // Maksimal 1MB

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080, // Menggunakan PORT dari environment variable
        host: '0.0.0.0' // Mengatur host ke 0.0.0.0
    });

    await server.register(Inert);

    // Endpoint untuk prediksi
    server.route({
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                output: 'stream',
                parse: false,
                allow: 'multipart/form-data',
                maxBytes: 1000000 // Maksimal 1MB
            }
        },
        handler: async (request, h) => {
            const data = request.payload;

            // Validasi file
            if (!data.image) {
                return h.response({
                    status: "fail",
                    message: "Terjadi kesalahan dalam melakukan prediksi"
                }).code(400);
            }

            // Simulasi prediksi model
            const isCancer = Math.random() < 0.5; // Contoh logika prediksi
            const response = {
                status: "success",
                message: "Model is predicted successfully",
                data: {
                    id: "77bd90fc-c126-4ceb-828d-f048dddff746",
                    result: isCancer ? "Cancer" : "Non-cancer",
                    suggestion: isCancer ? "Segera periksa ke dokter!" : "Penyakit kanker tidak terdeteksi.",
                    createdAt: new Date().toISOString()
                }
            };

            return h.response(response).code(200);
        }
    });

    // Menangani error jika ukuran file terlalu besar
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom && response.output.statusCode === 413) {
            return h.response({
                status: "fail",
                message: "Payload content length greater than maximum allowed: 1000000"
            }).code(413);
        }
        return h.continue;
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();