package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.Asset;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository assetRepository;

    @GetMapping
    public List<Asset> getAllAssets() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return assetRepository.findByUser(user);
    }

    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        asset.setUser(user);
        return assetRepository.save(asset);
    }

    @PutMapping("/{id}")
    public Asset updateAsset(@PathVariable Long id, @RequestBody Asset assetDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (!asset.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        asset.setName(assetDetails.getName());
        asset.setValue(assetDetails.getValue());
        asset.setType(assetDetails.getType());
        return assetRepository.save(asset);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (!asset.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        assetRepository.delete(asset);
        return ResponseEntity.noContent().build();
    }
}
