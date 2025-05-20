package com.universidad.dto;

import java.io.Serializable;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MateriaDTO implements Serializable {
    private Long id;

    @NotBlank(message = "El nombre de la materia es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre de la materia debe tener entre 3 y 100 caracteres")
    private String nombreMateria;

    @NotBlank(message = "El código único es obligatorio")
    @Size(min = 3, max = 20, message = "El código único debe tener entre 3 y 20 caracteres")
    private String codigoUnico;

    @NotNull(message = "Los créditos son obligatorios")
    @Min(value = 1, message = "Los créditos deben ser mayores a 0")
    private Integer creditos;

    /**
     * Lista de IDs de materias que son prerequisitos para esta materia.
     */
    private List<Long> prerequisitos;

    /**
     * Lista de IDs de materias para las que esta materia es prerequisito.
     */
    private List<Long> esPrerequisitoDe;
}