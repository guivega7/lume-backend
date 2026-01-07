package com.example.projetofinanceiro.util;

public class CpfValidator {

    public static boolean isValid(String cpf) {
        if (cpf == null) return false;
        
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^0-9]", "");
        
        // Verifica tamanho
        if (cpf.length() != 11) return false;
        
        // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
        if (cpf.matches("(\\d)\\1{10}")) return false;

        try {
            // Cálculo do primeiro dígito verificador
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int firstDigit = 11 - (sum % 11);
            if (firstDigit >= 10) firstDigit = 0;

            if (Character.getNumericValue(cpf.charAt(9)) != firstDigit) return false;

            // Cálculo do segundo dígito verificador
            sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            int secondDigit = 11 - (sum % 11);
            if (secondDigit >= 10) secondDigit = 0;

            return Character.getNumericValue(cpf.charAt(10)) == secondDigit;
        } catch (Exception e) {
            return false;
        }
    }
}
