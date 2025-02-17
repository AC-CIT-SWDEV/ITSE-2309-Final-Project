const withAuth = () => {

    if (document.cookie) {
        console.log(document.cookie)
        const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=');

        if (!token) {
            return window.location.href = 'login.html';
        }

        try {
            const decodedToken = jwt_decode(token);
            if (decodedToken.exp < Date.now() / 1000) {
                return window.location.href = 'login.html';
            }
        } catch (err) {
            console.error('Error decoding token:', err);
            return window.location.href = 'login.html';
        }
    } else {
        return window.location.href = 'login.html';
    }
};