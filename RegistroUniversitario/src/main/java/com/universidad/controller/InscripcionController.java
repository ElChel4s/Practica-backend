package com.universidad.controller;

import com.universidad.dto.ErrorResponse;
import com.universidad.dto.InscripcionDTO;
import com.universidad.service.IInscripcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/inscripciones")
public class InscripcionController {
    private static final Logger logger = LoggerFactory.getLogger(InscripcionController.class);
    
    @Autowired
    private IInscripcionService inscripcionService;

    @PostMapping
    public ResponseEntity<InscripcionDTO> crear(@RequestBody InscripcionDTO dto) {
        return ResponseEntity.ok(inscripcionService.crearInscripcion(dto));
    }
    
    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            logger.info("Solicitando listar todas las inscripciones");
            List<InscripcionDTO> inscripciones = inscripcionService.listarTodasLasInscripciones();
            logger.info("Se encontraron {} inscripciones", inscripciones.size());
            return ResponseEntity.ok(inscripciones);
        } catch (Exception e) {
            logger.error("Error al listar todas las inscripciones", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Error al listar inscripciones", e.getMessage()));
        }
    }

    @GetMapping("/estudiante/{id}")
    public ResponseEntity<List<InscripcionDTO>> listarPorEstudiante(@PathVariable Long id) {
        return ResponseEntity.ok(inscripcionService.listarInscripcionesPorEstudiante(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InscripcionDTO> actualizar(@PathVariable Long id, @RequestBody InscripcionDTO dto) {
        return ResponseEntity.ok(inscripcionService.actualizarInscripcion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @RequestParam String usuarioBaja) {
        inscripcionService.eliminarInscripcion(id, usuarioBaja);
        return ResponseEntity.noContent().build();
    }
}
