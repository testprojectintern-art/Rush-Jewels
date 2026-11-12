# Spring Boot Sync Setup Guide

This folder contains pre-configured Java files for setting up product synchronization on your Spring Boot application.

## 1. MySQL Database Migration
You need to add a `mongo_id` column to your `products` table in MySQL. If you are starting fresh, Hibernate can generate the table automatically. If the table already exists, run the following SQL query:

```sql
ALTER TABLE products ADD COLUMN mongo_id VARCHAR(255) UNIQUE;
```

If your schema naming strategy does not map `stockQty` to `stock_qty` and `imageUrl` to `image_url` automatically, ensure the columns exist in your table.

---

## 2. Copy the Java Files
1. Copy the Java files (`Product.java`, `PosProductRequestDTO.java`, `ProductRepository.java`, and `SyncController.java`) into your Spring Boot project structure.
2. Update the `package com.rushjewels.sync;` statement at the top of each file to match your project's package structure (e.g., `package com.mycompany.webstore.sync;`).
3. Modify the `@RestController` path if you want to use a different base API endpoint.

---

## 3. Enable CORS (Cross-Origin Resource Sharing)
Since the MERN POS backend (Node.js) runs on a different port/domain (e.g. `http://localhost:5005`), make sure your Spring Boot application allows CORS requests from the MERN backend.

You can add the `@CrossOrigin` annotation to the `SyncController` class:
```java
@CrossOrigin(origins = "http://localhost:5005")
```
Or configure it globally in your WebMvcConfigurer configuration class.

---

## 4. Security Passphrase Configuration
In `SyncController.java`, change `"MY_SUPER_SECRET_PASSPHRASE"` to a secure, long token of your choice. Ensure this token matches the `SPRING_BOOT_SECRET_KEY` in the MERN POS `.env` file.
