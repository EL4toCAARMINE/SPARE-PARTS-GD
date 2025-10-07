
export type PaginationDTO = {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number
}

export type ApiResponse<T> = { 
    response: boolean; 
    message: string; 
    Data: T | null 
}

export type PageDTO = { 
    data: any; pagination: 
    PaginationDTO 
}