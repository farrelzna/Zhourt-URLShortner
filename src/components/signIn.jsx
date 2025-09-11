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
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>to your account if you have already one</CardDescription>
                    {error && <Error message={error.message} />}
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                        <Input name="email" type="email" placeholder="Enter your email" onChange={handleInputChange} />
                        {errors.email && <Error message={errors.email} />}
                    </div>
                    <div className="space-y-1">
                        <Input name="password" type="password" placeholder="Enter your password" onChange={handleInputChange} />
                        {errors.password && <Error message={errors.password} />}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSignIn}>
                        {loading ? <BeatLoader size={8} color="white" /> : "Sign In"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SignIn