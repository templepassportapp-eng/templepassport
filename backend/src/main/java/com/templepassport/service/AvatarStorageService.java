package com.templepassport.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AvatarStorageService {

    @Value("${storage.avatar-bucket:temple-passport-avatars}")
    private String bucket;

    public String uploadAvatar(UUID userId, byte[] imageBytes) {
        Storage storage = StorageOptions.getDefaultInstance().getService();
        String objectName = "avatars/" + userId + ".jpg";
        BlobId blobId = BlobId.of(bucket, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("image/jpeg")
                .build();
        storage.create(blobInfo, imageBytes);
        return "https://storage.googleapis.com/" + bucket + "/" + objectName;
    }
}
