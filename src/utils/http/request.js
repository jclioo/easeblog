import axios from 'axios'

export default function ({data}) {
    const baseUrl = '/api'
    const server = axios.create({
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Content-Type':'text/plain;charset=UTF-8',
        },
        baseURL: baseUrl,
        timeout: 5000
    })
    return server(data)
}
