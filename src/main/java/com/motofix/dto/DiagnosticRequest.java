package com.motofix.dto;

import jakarta.validation.constraints.NotBlank;

public record DiagnosticRequest(@NotBlank String diagnostic) {
}
