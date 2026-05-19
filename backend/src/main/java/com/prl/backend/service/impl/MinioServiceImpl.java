package com.prl.backend.service.impl;

import com.prl.backend.entity.FileMetadata;
import com.prl.backend.entity.User;
import com.prl.backend.repository.FileMetadataRepository;
import com.prl.backend.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;
    private final FileMetadataRepository fileMetadataRepository;

    @Value("${app.minio.url}")
    private String minioUrl;

    @Value("${app.minio.public-url:${app.minio.url}}")
    private String minioPublicUrl;

    @Value("${app.minio.bucket}")
    private String bucketName;

    @Override
    public FileMetadata uploadFile(MultipartFile file, User uploadedBy) {
        try {
            String objectKey = UUID.randomUUID() + "_" +
                    file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");

            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            FileMetadata fileMetadata = FileMetadata.builder()
                    .bucketName(bucketName)
                    .objectKey(objectKey)
                    .originalFilename(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedBy(uploadedBy)
                    .build();

            return fileMetadataRepository.save(fileMetadata);
        } catch (Exception e) {
            throw new RuntimeException("Error al subir fichero a MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPresignedUrl(FileMetadata fileMetadata) {
        try {
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(fileMetadata.getBucketName())
                            .object(fileMetadata.getObjectKey())
                            .expiry(1, TimeUnit.HOURS)
                            .build());
            // Reemplaza el host interno de Docker por el host público accesible desde el navegador
            presignedUrl = presignedUrl.replace(minioUrl, minioPublicUrl);
            return presignedUrl;
        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al generar URL presignada: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(FileMetadata fileMetadata) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(fileMetadata.getBucketName())
                    .object(fileMetadata.getObjectKey())
                    .build());
            fileMetadataRepository.delete(fileMetadata);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar fichero de MinIO: " + e.getMessage(), e);
        }
    }
}
