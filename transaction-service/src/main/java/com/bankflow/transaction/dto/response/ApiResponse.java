package com.bankflow.transaction.dto.response;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    public static <T> ApiResponse<T> success(T d, String m) { return ApiResponse.<T>builder().success(true).message(m).data(d).build(); }
    public static <T> ApiResponse<T> error(String m) { return ApiResponse.<T>builder().success(false).message(m).build(); }
}
