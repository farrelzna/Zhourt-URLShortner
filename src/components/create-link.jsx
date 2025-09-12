import { useEffect, useRef, useState } from 'react';
import { UrlState } from '@/context'
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from './ui/button';
import { Input } from './ui/input';
import Error from './error';
import { Card } from './ui/card';
import * as Yup from 'yup';
import QRCode from 'react-qrcode-logo';
import { createUrls } from '@/db/apiUrls';
import useFetch from '@/hooks/use-fetch';
import { BeatLoader } from 'react-spinners';

const CreateLink = () => {

    const { user } = UrlState();
    const navigate = useNavigate();
    const ref = useRef();

    let [searchParams, setSearchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const [errors, setErrors] = useState([]);
    const [formValues, setFormValues] = useState({
        title: "",
        longUrl: longLink ? longLink : "",
        customUrl: "",
    });

    const schema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        longUrl: Yup.string().url("Invalid URL").required("Long URL is required"),
        customUrl: Yup.string(),
    });

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.id]: e.target.value,
        });
    }

    const {
        loading,
        error,
        data,
        fn: fnCreateUrl
    } = useFetch(createUrls, { ...formValues, user_id: user.id });

    useEffect(() => {
        if (error === null && data) {
            navigate(`/link/${data[0].id}`);
        }
    }, [error, data]);

    const createNewLink = async () => {
        setErrors([]);
        try {
            await schema.validate(formValues, { abortEarly: false });
            const canvas = ref.current.canvasRef.current;
            const blob = await new Promise((resolve) => canvas.toBlob(resolve));

            await fnCreateUrl(blob);
        } catch (e) {
            const newErrors = {};

            e?.inner?.forEach((err) => {
                newErrors[err.path] = err.message;
            })

            setErrors(newErrors);
        }
    }

    return (
        <Dialog
            defaultOpen={longLink}
            onOpenChange={(res) => {
                if (!res) setSearchParams({});
            }}
        >
            <DialogTrigger>
                <Button variant={"destructive"}>Create New Link</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={"text-2xl"}>Create New</DialogTitle>
                </DialogHeader>

                {formValues?.longUrl && (
                    <QRCode value={formValues.longUrl} size={250} ref={ref} />
                )}

                <Input
                    id="title"
                    placeholder="Short Link Title"
                    value={formValues.title}
                    onChange={handleChange}
                />
                {errors.title && <Error message={errors.title} />}

                <Input
                    id="longUrl"
                    placeholder="Enter your loooonggg url"
                    value={formValues.longUrl}
                    onChange={handleChange}
                />
                {errors.longUrl && <Error message={errors.longUrl} />}

                <div className='flex items-center gap-2'>
                    <Card className="p-2">Zhourt.in</Card> /
                    <Input
                        id="customUrl"
                        placeholder="Custom Link (optional)"
                        value={formValues.customUrl}
                        onChange={handleChange}
                    />
                </div>
                {error && <Error message={error.message} />}

                <DialogFooter className={"sm:justify-start"}>
                    <Button
                        disabled={loading}
                        onClick={createNewLink}
                        type="submit">
                        {loading ? <BeatLoader size={10} color="#fff" /> : "Create Link"}
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/dashboard?${searchParams.toString()}`)}>Cancel</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default CreateLink