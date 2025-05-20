package com.universidad.dto;

import java.io.Serializable;
import java.time.LocalDate;

public class InscripcionDTO implements Serializable {
    private Long id;
    private Long estudianteId;
    private Long materiaId;
    private LocalDate fechaInscripcion;
    private String estado;
    private String usuarioAlta;
    private LocalDate fechaAlta;
    private String usuarioBaja;
    private LocalDate fechaBaja;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEstudianteId() { return estudianteId; }
    public void setEstudianteId(Long estudianteId) { this.estudianteId = estudianteId; }
    public Long getMateriaId() { return materiaId; }
    public void setMateriaId(Long materiaId) { this.materiaId = materiaId; }
    public LocalDate getFechaInscripcion() { return fechaInscripcion; }
    public void setFechaInscripcion(LocalDate fechaInscripcion) { this.fechaInscripcion = fechaInscripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getUsuarioAlta() { return usuarioAlta; }
    public void setUsuarioAlta(String usuarioAlta) { this.usuarioAlta = usuarioAlta; }
    public LocalDate getFechaAlta() { return fechaAlta; }
    public void setFechaAlta(LocalDate fechaAlta) { this.fechaAlta = fechaAlta; }
    public String getUsuarioBaja() { return usuarioBaja; }
    public void setUsuarioBaja(String usuarioBaja) { this.usuarioBaja = usuarioBaja; }
    public LocalDate getFechaBaja() { return fechaBaja; }
    public void setFechaBaja(LocalDate fechaBaja) { this.fechaBaja = fechaBaja; }
}
