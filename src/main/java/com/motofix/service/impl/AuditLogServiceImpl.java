package com.motofix.service.impl;

import com.motofix.dto.AuditLogResponse;
import com.motofix.entity.AuditLog;
import com.motofix.repository.AuditLogRepository;
import com.motofix.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String action, String detail) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .detail(detail)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> findLatest() {
        return auditLogRepository.findAll(PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(log -> new AuditLogResponse(log.getId(), log.getAction(), log.getDetail(), log.getCreatedAt()))
                .toList();
    }
}
