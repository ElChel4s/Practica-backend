package com.universidad.service.impl;

import com.universidad.model.Materia;
import com.universidad.repository.MateriaRepository;
import com.universidad.service.IMateriaService;
import com.universidad.dto.MateriaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements IMateriaService {

    @Autowired
    private MateriaRepository materiaRepository;

    // Método utilitario para mapear Materia a MateriaDTO
    private MateriaDTO mapToDTO(Materia materia) {
        if (materia == null) return null;
        return MateriaDTO.builder()
                .id(materia.getId())
                .nombreMateria(materia.getNombreMateria())
                .codigoUnico(materia.getCodigoUnico())
                .creditos(materia.getCreditos())
                .prerequisitos(materia.getPrerequisitos() != null ?
                    materia.getPrerequisitos().stream().map(Materia::getId).collect(Collectors.toList()) : null)
                .esPrerequisitoDe(materia.getEsPrerequisitoDe() != null ?
                    materia.getEsPrerequisitoDe().stream().map(Materia::getId).collect(Collectors.toList()) : null)
                .build();
    }

    // Método utilitario para mapear DTO a entidad Materia (sin prerequisitos)
    private Materia mapToEntityBasic(MateriaDTO dto) {
        Materia materia = new Materia();
        materia.setId(dto.getId());
        materia.setNombreMateria(dto.getNombreMateria());
        materia.setCodigoUnico(dto.getCodigoUnico());
        materia.setCreditos(dto.getCreditos());
        return materia;
    }

    @Override
    @Cacheable(value = "materias")
    public List<MateriaDTO> obtenerTodasLasMaterias() {
        return materiaRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "materia", key = "#id")
    public MateriaDTO obtenerMateriaPorId(Long id) {
        return materiaRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    @Override
    @Cacheable(value = "materia", key = "#codigoUnico")
    public MateriaDTO obtenerMateriaPorCodigoUnico(String codigoUnico) {
        Materia materia = materiaRepository.findByCodigoUnico(codigoUnico);
        return mapToDTO(materia);
    }

    @Override
    @CachePut(value = "materia", key = "#result.id")
    @CacheEvict(value = "materias", allEntries = true)
    @Transactional
    public MateriaDTO crearMateria(MateriaDTO materiaDTO) {
        if (materiaRepository.findByCodigoUnico(materiaDTO.getCodigoUnico()) != null) {
            throw new DataIntegrityViolationException("El código único ya existe: " + materiaDTO.getCodigoUnico());
        }
        Materia materia = mapToEntityBasic(materiaDTO);
        // Prerequisitos
        if (materiaDTO.getPrerequisitos() != null && !materiaDTO.getPrerequisitos().isEmpty()) {
            List<Materia> prereqs = materiaDTO.getPrerequisitos().stream()
                .map(pid -> materiaRepository.findById(pid).orElseThrow(() -> new IllegalArgumentException("Prerequisito no encontrado: " + pid)))
                .collect(Collectors.toList());
            // Validar ciclos
            for (Materia prereq : prereqs) {
                if (prereq.getId().equals(materia.getId())) {
                    throw new IllegalArgumentException("Una materia no puede ser prerequisito de sí misma");
                }
                if (prereq.formariaCirculo(materia.getId())) {
                    throw new IllegalArgumentException("Agregar el prerequisito formaría un ciclo");
                }
            }
            materia.setPrerequisitos(prereqs);
        }
        Materia savedMateria = materiaRepository.save(materia);
        return mapToDTO(savedMateria);
    }

    @Override
    @CachePut(value = "materia", key = "#id")
    @CacheEvict(value = "materias", allEntries = true)
    @Transactional
    public MateriaDTO actualizarMateria(Long id, MateriaDTO materiaDTO) {
        Materia materia = materiaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));
        Materia existente = materiaRepository.findByCodigoUnico(materiaDTO.getCodigoUnico());
        if (existente != null && !existente.getId().equals(id)) {
            throw new DataIntegrityViolationException("El código único ya existe: " + materiaDTO.getCodigoUnico());
        }
        materia.setNombreMateria(materiaDTO.getNombreMateria());
        materia.setCodigoUnico(materiaDTO.getCodigoUnico());
        materia.setCreditos(materiaDTO.getCreditos());
        // Prerequisitos
        if (materiaDTO.getPrerequisitos() != null) {
            List<Materia> prereqs = materiaDTO.getPrerequisitos().stream()
                .map(pid -> materiaRepository.findById(pid).orElseThrow(() -> new IllegalArgumentException("Prerequisito no encontrado: " + pid)))
                .collect(Collectors.toList());
            for (Materia prereq : prereqs) {
                if (prereq.getId().equals(id)) {
                    throw new IllegalArgumentException("Una materia no puede ser prerequisito de sí misma");
                }
                if (prereq.formariaCirculo(id)) {
                    throw new IllegalArgumentException("Agregar el prerequisito formaría un ciclo");
                }
            }
            materia.setPrerequisitos(prereqs);
        } else {
            materia.setPrerequisitos(null);
        }
        Materia updatedMateria = materiaRepository.save(materia);
        return mapToDTO(updatedMateria);
    }

    @Override
    @CacheEvict(value = {"materia", "materias"}, allEntries = true)
    @Transactional // Permite operaciones de escritura y bloqueos
    public void eliminarMateria(Long id) {
        Materia materia = materiaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Materia no encontrada"));
        // DEBUG: Log para ver si la materia es prerrequisito de otra
        System.out.println("[DEBUG] esPrerequisitoDe: " + (materia.getEsPrerequisitoDe() != null ? materia.getEsPrerequisitoDe().size() : "null"));
        if (materia.getEsPrerequisitoDe() != null && !materia.getEsPrerequisitoDe().isEmpty()) {
            System.out.println("[DEBUG] No se puede eliminar porque es prerrequisito de otra materia");
            throw new IllegalArgumentException("No se puede eliminar la materia porque es prerrequisito de otra materia.");
        }
        materiaRepository.deleteById(id);
    }
}
