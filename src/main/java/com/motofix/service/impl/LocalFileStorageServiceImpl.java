package com.motofix.service.impl;

import com.motofix.service.FileStorageService;
import org.springframework.stereotype.Service;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {
    @Override
    public String storeReport(String fileName, String content) {
        return "reports/" + fileName;
    }
}
