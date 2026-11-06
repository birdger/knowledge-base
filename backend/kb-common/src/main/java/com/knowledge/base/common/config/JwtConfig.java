package com.knowledge.base.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import io.jsonwebtoken.security.Keys;

/**
 * JWT配置类
 *
 * <p>提供JWT Token的配置属性，包括密钥、过期时间和发行者信息</p>
 *
 * @author birdger
 * @since 1.0.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    /**
     * JWT密钥
     */
    private String secret = "change-me-in-production-please-use-32bytes-min";

    /**
     * 访问令牌过期时间（秒）
     */
    private Long expiration = 7200L;

    /**
     * 刷新令牌过期时间（秒）
     */
    private Long refreshExpiration = 604800L;

    /**
     * 发行者
     */
    private String issuer = "knowledge-base";

    /**
     * 获取密钥对象
     *
     * @return 密钥对象
     */
    public SecretKey secretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
