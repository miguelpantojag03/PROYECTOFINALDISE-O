package com.motofix.service.impl;

import com.motofix.service.CacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Profile("redis")
@RequiredArgsConstructor
public class RedisCacheServiceImpl implements CacheService {
    private final StringRedisTemplate redisTemplate;

    @Override
    public void put(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public Optional<String> get(String key) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(key));
    }

    @Override
    public void evict(String key) {
        redisTemplate.delete(key);
    }
}
