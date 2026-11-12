package com.rushjewels.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/product")
    public ResponseEntity<Map<String, Object>> syncProductFromPos(
            @RequestHeader("X-POS-SECRET-KEY") String secretKey,
            @RequestBody PosProductRequestDTO dto) {

        // Security Check
        if (!"MY_SUPER_SECRET_PASSPHRASE".equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Check if product already exists (For Update/Edit)
        Product product = productRepository.findByMongoId(dto.getMongoId())
                .orElse(new Product());

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStockQty(dto.getStockQty());
        product.setImageUrl(dto.getImageUrl());
        product.setMongoId(dto.getMongoId());

        Product savedProduct = productRepository.save(product);

        // Send back MySQL ID to POS
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mysqlId", savedProduct.getId());

        return ResponseEntity.ok(response);
    }
}
