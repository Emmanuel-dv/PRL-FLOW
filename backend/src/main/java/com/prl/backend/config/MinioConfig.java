package com.prl.backend.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class MinioConfig {

    @Value("${app.minio.url}")
    private String minioUrl;

    @Value("${app.minio.public-url:${app.minio.url}}")
    private String minioPublicUrl;

    @Value("${app.minio.access-key}")
    private String accessKey;

    @Value("${app.minio.secret-key}")
    private String secretKey;

    @Value("${app.minio.bucket}")
    private String bucketName;

    /**
     * Cliente interno para operaciones de upload/delete.
     * Usa la URL interna de Docker para comunicación entre contenedores.
     * Es el @Primary para que Spring lo inyecte por defecto donde se declare MinioClient.
     */
    @Bean
    @Primary
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * Cliente público para generar URLs presignadas.
     * Usa la IP pública para que las URLs firmadas sean resolvibles desde el navegador.
     * La firma HMAC se calcula con el endpoint público, por lo que no habrá SignatureDoesNotMatch.
     */
    @Bean("minioPublicClient")
    public MinioClient minioPublicClient() {
        return MinioClient.builder()
                .endpoint(minioPublicUrl)
                .credentials(accessKey, secretKey)
                .build();
    }
}
