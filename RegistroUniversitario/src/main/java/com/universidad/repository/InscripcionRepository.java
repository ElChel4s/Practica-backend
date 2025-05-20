package com.universidad.repository;

import com.universidad.model.Inscripcion;
import com.universidad.model.Estudiante;
import com.universidad.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    List<Inscripcion> findByEstudianteId(Long estudianteId);
    Optional<Inscripcion> findByEstudianteAndMateria(Estudiante estudiante, Materia materia);
    boolean existsByEstudianteAndMateria(Estudiante estudiante, Materia materia);
}
