import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { initGmailApi, setGmailToken } from '../gmail/api';

export function useAuth() {
    const [token, setToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // Checks for existing token in localStorage on mount
    useEffect(() => {
        initGmailApi().then(() => {
            const storedToken = localStorage.getItem('gmail_token');
            if (storedToken) {
                // Very basic token restore, Ideally we'll check expiry
                setToken(storedToken);
                setGmailToken(storedToken);
                fetchUserProfile(storedToken);
            }
        }).catch(console.error);
    }, []);

    const fetchUserProfile = async (accessToken) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');
            const data = await response.json();
            setUserProfile(data);
        } catch (error) {
            console.error(error);
            logout();
        }
    };

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            const accessToken = codeResponse.access_token;
            setToken(accessToken);
            setGmailToken(accessToken);
            localStorage.setItem('gmail_token', accessToken);
            fetchUserProfile(accessToken);
        },
        onError: (error) => console.log('Login Failed:', error),
        scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels',
    });

    const logout = () => {
        googleLogout();
        setToken(null);
        setUserProfile(null);
        localStorage.removeItem('gmail_token');
    };

    return { token, userProfile, login, logout };
}
