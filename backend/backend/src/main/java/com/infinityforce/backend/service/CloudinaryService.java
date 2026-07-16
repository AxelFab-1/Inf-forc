package com.infinityforce.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public Map<String, Object> subirArchivo(MultipartFile archivo, String carpeta) throws IOException {
        return cloudinary.uploader().upload(archivo.getBytes(), ObjectUtils.asMap(
                "folder", carpeta
        ));
    }

    public Map<String, Object> eliminarArchivo(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
