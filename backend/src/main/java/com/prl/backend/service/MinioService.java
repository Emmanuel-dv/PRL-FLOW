package com.prl.backend.service;

import com.prl.backend.entity.FileMetadata;
import com.prl.backend.entity.User;
import org.springframework.web.multipart.MultipartFile;

public interface MinioService {

    FileMetadata uploadFile(MultipartFile file, User uploadedBy);

    String getPresignedUrl(FileMetadata fileMetadata);

    void deleteFile(FileMetadata fileMetadata);
}
