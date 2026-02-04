export interface MeetCreateRequest {
    eventName: string;
    customerName: string;
    email: string;
    phone: string;
    location: string;
    platform: string;
    devices: string;
    description?: string;
    start?: string;
    end?: string;
}

export interface MeetUpdateRequest {
        eventName?: string;
        customerName?: string;
        email?: string;
        phone?: string;
        location?: string;
        platform?: string;
        devices?: string;
        url?: string;
        shortUrl?: string;
        status?: string;
        description?: string;
        admin?: string;
        start?: string;
        end?: string;
}

export interface MeetQueryRequest {
    page: number;
    limit: number;
    status?: string;
    sortBy?: string;
    order?: string;
}