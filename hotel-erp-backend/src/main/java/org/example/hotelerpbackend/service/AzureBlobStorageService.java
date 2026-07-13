package org.example.hotelerpbackend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobContainerClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
public class AzureBlobStorageService {

    private final BlobContainerClient containerClient;

    public AzureBlobStorageService(
            @Value("${azure.storage.connection-string}") String connectionString,
            @Value("${azure.storage.container-name}") String containerName
    ) {
        this.containerClient = new BlobContainerClientBuilder()
                .connectionString(connectionString)
                .containerName(containerName)
                .buildClient();

        if (!this.containerClient.exists()) {
            this.containerClient.create();
        }
    }

    public String uploadPdf(String fileName, byte[] pdfBytes) {
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        blobClient.upload(
                new ByteArrayInputStream(pdfBytes),
                pdfBytes.length,
                true
        );

        return blobClient.getBlobUrl();
    }

    public byte[] downloadPdf(String fileName) {
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        if (!blobClient.exists()) {
            throw new RuntimeException("Invoice PDF not found in Azure Storage");
        }

        return blobClient.downloadContent().toBytes();
    }
}