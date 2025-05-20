package com.universidad.service;

import com.universidad.dto.InscripcionDTO;
import java.util.List;

public interface IInscripcionService {
    InscripcionDTO crearInscripcion(InscripcionDTO inscripcionDTO);
    List<InscripcionDTO> listarInscripcionesPorEstudiante(Long estudianteId);
    List<InscripcionDTO> listarTodasLasInscripciones();
    InscripcionDTO actualizarInscripcion(Long id, InscripcionDTO inscripcionDTO);
    void eliminarInscripcion(Long id, String usuarioBaja);
}
