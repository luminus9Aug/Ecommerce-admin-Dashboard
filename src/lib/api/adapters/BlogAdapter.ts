import { BaseAdapter } from "./BaseAdapter";
import { API_ENDPOINTS } from "../endpoints";
import type { CursorPaginatedResponse, BlogPost, CreateBlogPostPayload, BlogCategory } from "@/types/admin";

class BlogAdapter extends BaseAdapter {
  public async getBlogs(params?: { cursor?: string; limit?: number }): Promise<CursorPaginatedResponse<BlogPost>> {
    return this.get<CursorPaginatedResponse<BlogPost>>(API_ENDPOINTS.BLOGS.ADMIN_ALL, { params });
  }

  public async getBlogCategories(): Promise<BlogCategory[]> {
    return this.get<BlogCategory[]>(API_ENDPOINTS.BLOGS.CATEGORIES);
  }

  public async createBlogCategory(name: string): Promise<BlogCategory> {
    return this.post<BlogCategory>(API_ENDPOINTS.BLOGS.CATEGORIES, { name });
  }

  public async getBlogById(id: string): Promise<BlogPost> {
    return this.get<BlogPost>(API_ENDPOINTS.BLOGS.BY_ID(id));
  }

  public async getBlogBySlug(slug: string): Promise<BlogPost> {
    return this.get<BlogPost>(API_ENDPOINTS.BLOGS.BY_SLUG(slug));
  }

  public async createBlog(payload: CreateBlogPostPayload): Promise<BlogPost> {
    return this.post<BlogPost>(API_ENDPOINTS.BLOGS.BASE, payload);
  }

  public async updateBlog(id: string, payload: Partial<CreateBlogPostPayload>): Promise<BlogPost> {
    return this.patch<BlogPost>(`${API_ENDPOINTS.BLOGS.BASE}/${id}`, payload);
  }

  public async deleteBlog(id: string): Promise<void> {
    return this.delete<void>(`${API_ENDPOINTS.BLOGS.BASE}/${id}`);
  }
}

export const blogAdapter = new BlogAdapter();
