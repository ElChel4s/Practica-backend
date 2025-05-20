package com.universidad.service.impl;

import com.universidad.dto.InscripcionDTO;
import com.universidad.model.Estudiante;
import com.universidad.model.Inscripcion;
import com.universidad.model.Materia;
import com.universidad.repository.EstudianteRepository;
import com.universidad.repository.InscripcionRepository;
import com.universidad.repository.MateriaRepository;
import com.universidad.service.IInscripcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InscripcionServiceImpl implements IInscripcionService {
    private static final Logger logger = LoggerFactory.getLogger(InscripcionServiceImpl.class);

    @Autowired
    private InscripcionRepository inscripcionRepository;
    @Autowired
    private EstudianteRepository estudianteRepository;
    @Autowired
    private MateriaRepository materiaRepository;

    @Override
    @Transactional
    public InscripcionDTO crearInscripcion(InscripcionDTO dto) {
        logger.info("Intentando crear inscripción: {}", dto);
        if (dto.getEstudianteId() == null || dto.getMateriaId() == null) {
            logger.warn("Faltan datos obligatorios para la inscripción: {}", dto);
            throw new IllegalArgumentException("Faltan datos obligatorios para la inscripción");
        }
        Estudiante estudiante = estudianteRepository.findById(dto.getEstudianteId())
                .orElseThrow(() -> {
                    logger.warn("Estudiante no encontrado: {}", dto.getEstudianteId());
                    return new IllegalArgumentException("Estudiante no encontrado");
                });
        Materia materia = materiaRepository.findById(dto.getMateriaId())
                .orElseThrow(() -> {
                    logger.warn("Materia no encontrada: {}", dto.getMateriaId());
                    return new IllegalArgumentException("Materia no encontrada");
                });
        // Validar que no exista inscripción previa
        if (inscripcionRepository.existsByEstudianteAndMateria(estudiante, materia)) {
            logger.warn("El estudiante ya está inscripto en esta materia: estudianteId={}, materiaId={}", estudiante.getId(), materia.getId());
            throw new IllegalArgumentException("El estudiante ya está inscripto en esta materia");
        }
        // Validar correlatividades/prerrequisitos
        // Si la materia tiene prerrequisitos, el estudiante debe tener inscripciones activas en todas ellas
        List<Materia> prerequisitos = materia.getPrerequisitos() != null ? materia.getPrerequisitos() : List.of();
        if (!prerequisitos.isEmpty()) {
            List<Inscripcion> inscripcionesEstudiante = inscripcionRepository.findByEstudianteId(estudiante.getId());
            List<Long> materiasAprobadas = inscripcionesEstudiante.stream()
                .filter(insc -> "activa".equalsIgnoreCase(insc.getEstado()))
                .map(insc -> insc.getMateria().getId())
                .collect(Collectors.toList());
            for (Materia prereq : prerequisitos) {
                if (!materiasAprobadas.contains(prereq.getId())) {
                    logger.warn("El estudiante no cumple con los prerrequisitos: estudianteId={}, materiaId={}, prerequisitoFaltante={}", estudiante.getId(), materia.getId(), prereq.getId());
                    throw new IllegalArgumentException("El estudiante no cumple con los prerrequisitos para esta materia");
                }
            }
        }        // Asegurar que el estudiante esté activo al inscribirlo (independientemente de su estado anterior)
        if (!"activo".equalsIgnoreCase(estudiante.getEstado())) {
            logger.info("Actualizando estado del estudiante a activo: {}", estudiante.getId());
            estudiante.setEstado("activo");
            estudiante.setFechaModificacion(LocalDate.now());
            estudiante.setUsuarioModificacion(dto.getUsuarioAlta());
            // Si tenía datos de baja, los limpiamos
            estudiante.setUsuarioBaja(null);
            estudiante.setFechaBaja(null);
            estudiante.setMotivoBaja(null);
            estudianteRepository.save(estudiante);
        }
        Inscripcion insc = new Inscripcion();
        insc.setEstudiante(estudiante);
        insc.setMateria(materia);
        insc.setFechaInscripcion(LocalDate.now());
        insc.setEstado("activa");
        insc.setUsuarioAlta(dto.getUsuarioAlta());
        insc.setFechaAlta(LocalDate.now());
        Inscripcion saved = inscripcionRepository.save(insc);
        logger.info("Inscripción creada exitosamente: id={}", saved.getId());
        return toDTO(saved);
    }    @Override
    public List<InscripcionDTO> listarInscripcionesPorEstudiante(Long estudianteId) {
        return inscripcionRepository.findByEstudianteId(estudianteId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    @Override
    public List<InscripcionDTO> listarTodasLasInscripciones() {
        logger.info("Obteniendo todas las inscripciones");
        try {
            List<Inscripcion> inscripciones = inscripcionRepository.findAll();
            logger.info("Se encontraron {} inscripciones", inscripciones.size());
            return inscripciones.stream()
                   .map(this::toDTO)
                   .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error al obtener todas las inscripciones", e);
            throw new RuntimeException("Error al obtener todas las inscripciones", e);
        }
    }

    @Override
    @Transactional
    public InscripcionDTO actualizarInscripcion(Long id, InscripcionDTO dto) {
        Inscripcion insc = inscripcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscripción no encontrada"));
        if (dto.getEstado() != null) insc.setEstado(dto.getEstado());
        if (dto.getUsuarioBaja() != null) insc.setUsuarioBaja(dto.getUsuarioBaja());
        if (dto.getFechaBaja() != null) insc.setFechaBaja(dto.getFechaBaja());
        Inscripcion updated = inscripcionRepository.save(insc);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void eliminarInscripcion(Long id, String usuarioBaja) {
        Inscripcion insc = inscripcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscripción no encontrada"));
        insc.setEstado("cancelada");
        insc.setUsuarioBaja(usuarioBaja);
        insc.setFechaBaja(LocalDate.now());
        inscripcionRepository.save(insc);
    }

    private InscripcionDTO toDTO(Inscripcion insc) {
        InscripcionDTO dto = new InscripcionDTO();
        dto.setId(insc.getId());
        dto.setEstudianteId(insc.getEstudiante().getId());
        dto.setMateriaId(insc.getMateria().getId());
        dto.setFechaInscripcion(insc.getFechaInscripcion());
        dto.setEstado(insc.getEstado());
        dto.setUsuarioAlta(insc.getUsuarioAlta());
        dto.setFechaAlta(insc.getFechaAlta());
        dto.setUsuarioBaja(insc.getUsuarioBaja());
        dto.setFechaBaja(insc.getFechaBaja());
        return dto;
    }
}
