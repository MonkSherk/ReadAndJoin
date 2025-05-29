import { create } from 'zustand'
import api from '../utils/api'

export const usePostStore = create((set) => ({
    posts: [],
    postDetail: null,
    loading: false,
    error: null,

    fetchPosts: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get('/posts/', { params: filters })
            set({ posts: res.data, loading: false })
        } catch (err) {
            set({ error: err, loading: false })
        }
    },

    createPost: async (data) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post('/posts/', data)
            set(state => ({ posts: [res.data, ...state.posts], loading: false }))
            return res.data
        } catch (err) {
            set({ error: err, loading: false })
            throw err
        }
    },

    fetchPostDetail: async (id) => {
        set({ loading: true, error: null })
        try {
            const res = await api.get(`/posts/${id}/`)
            set({ postDetail: res.data, loading: false })
        } catch (err) {
            set({ error: err, loading: false })
        }
    },

    createComment: async (postId, content, parent = null) => {
        set({ loading: true, error: null })
        try {
            const res = await api.post(`/posts/${postId}/comments/`, { content, parent })
            set(state => ({
                postDetail: {
                    ...state.postDetail,
                    comments: [...state.postDetail.comments, res.data]
                },
                loading: false
            }))
            return res.data
        } catch (err) {
            set({ error: err, loading: false })
            throw err
        }
    },

    likePost: async (postId) => {
        try {
            const res = await api.post(`/posts/${postId}/like/`)
            set({ postDetail: res.data })
            return res.data
        } catch (err) {
            set({ error: err })
            throw err
        }
    },
}))

