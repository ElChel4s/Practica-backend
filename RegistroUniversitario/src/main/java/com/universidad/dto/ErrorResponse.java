package com.universidad.dto;

/**
 * Clase para representar respuestas de error estándar en la API
 */
public class ErrorResponse {
    private String mensaje;
    private String detalles;

    public ErrorResponse() {
    }

    public ErrorResponse(String mensaje, String detalles) {
        this.mensaje = mensaje;
        this.detalles = detalles;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getDetalles() {
        return detalles;
    }

    public void setDetalles(String detalles) {
        this.detalles = detalles;
    }
}
