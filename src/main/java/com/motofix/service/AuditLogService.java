package com.motofix.service;

import com.motofix.dto.AuditLogResponse;

import java.util.List;

public interface AuditLogService {
    void record(String action, String detail);

    List<AuditLogResponse> findLatest();
}
