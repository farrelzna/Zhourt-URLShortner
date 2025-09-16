import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { BeatLoader } from 'react-spinners'
import Error from './error'
import * as Yup from 'yup'
import useFetch from '@/hooks/use-fetch'
import { login as signin } from '@/db/apiAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { UrlState } from '@/context'

const SignIn = () => {

    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    let [searchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const { data, loading, error, fn: fnSignIn } = useFetch(signin,formData);
    const { fetchUser } = UrlState();

    useEffect(() => {
        console.log(data);
        if (error === null && data) {
            navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
            fetchUser();
        }
    }, [data, error]);

    const handleSignIn = async () => {
        setErrors([]);
        // setLoading(true);
        try {
            const schema = Yup.object().shape({
                email: Yup.string().email("Invalid email format").required("Email is required"),
                password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
            });

            await schema.validate(formData, { abortEarly: false });
            // api call
            await fnSignIn(formData.email, formData.password);
        } catch (e) {
            const newErrors = {};

            e?.inner?.forEach((err) => {
                newErrors[err.path] = err.message;
            });

            setErrors(newErrors);
        }
    }

    return (
        <div className="space-y-4">
            {error && <Error message={error.message} />}
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Input 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        onChange={handleInputChange}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
                    />
                    {errors.email && <Error message={errors.email} />}
                </div>
                <div className="space-y-2">
                    <Input 
                        name="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        onChange={handleInputChange}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
                    />
                    {errors.password && <Error message={errors.password} />}
                </div>
            </div>
            
            <Button 
                onClick={handleSignIn}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                disabled={loading}
            >
                {loading ? <BeatLoader size={8} color="currentColor" /> : "Sign In"}
            </Button>
        </div>
    )
}

export default SignIn