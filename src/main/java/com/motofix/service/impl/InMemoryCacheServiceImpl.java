package com.motofix.service.impl;

import com.motofix.service.CacheService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryCacheServiceImpl implements CacheService {
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @Override
    public void put(String key, String value) {
        cache.put(key, value);
    }

    @Override
    public Optional<String> get(String key) {
        return Optional.ofNullable(cache.get(key));
    }

    @Override
    public void evict(String key) {
        cache.remove(key);
    }
}
