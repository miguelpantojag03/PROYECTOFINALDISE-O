package com.motofix.service;

import java.util.Optional;

public interface CacheService {
    void put(String key, String value);
    Optional<String> get(String key);
    void evict(String key);
}
