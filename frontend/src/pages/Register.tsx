import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Resident",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const change = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "phone") {
            let phone = value.replace(/\D/g, "");

            phone = phone.slice(0, 10);

            if (phone.length > 5) {
                phone = phone.slice(0, 5) + " " + phone.slice(5);
            }

            setForm({
                ...form,
                phone,
            });

            return;
        }

        setForm({
            ...form,
            [name]: value,
        });

        // If email is changed after OTP was sent,
        // require verification again.
        if (name === "email") {
            setOtpSent(false);
            setVerified(false);
            setOtp("");
            setMessage("");
        }
    };

    const validateEmail = () => {
        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        return emailRegex.test(form.email.trim());
    };

    /* =========================
       SEND OTP
    ========================= */

    const sendOtp = async () => {
        setError("");
        setMessage("");

        if (!validateEmail()) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setOtpLoading(true);

            const response = await fetch(
                ` ${API_URL}/api/auth/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to send OTP"
                );
            }

            setOtpSent(true);
            setVerified(false);
            setMessage(
                "OTP sent successfully. Please check your email."
            );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Failed to send OTP"
            );
        } finally {
            setOtpLoading(false);
        }
    };

    /* =========================
       VERIFY OTP
    ========================= */

    const verifyOtp = async () => {
        setError("");
        setMessage("");

        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        try {
            setOtpLoading(true);

            const response = await fetch(
                `${API_URL}/api/auth/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                        otp,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "OTP verification failed"
                );
            }

            setVerified(true);
            setMessage(
                "Email verified successfully! You can create your account now."
            );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "OTP verification failed"
            );
        } finally {
            setOtpLoading(false);
        }
    };

    /* =========================
       CREATE ACCOUNT
    ========================= */

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!validateEmail()) {
            setError("Please enter a valid email address.");
            return;
        }

        const phoneNumber = form.phone.replace(/\s/g, "");

        if (phoneNumber.length !== 10) {
            setError(
                "Phone number must contain exactly 10 digits."
            );
            return;
        }

        if (!verified) {
            setError(
                "Please verify your email with OTP before creating the account."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...form,
                        email: form.email.trim(),
                        phone: phoneNumber,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            navigate("/login");
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message :
                    "Registration failed"
            );
        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100
via-slate-100 to-indigo-100 p-4">

            <form
                onSubmit={submit}

                className="w-full max-w-md rounded-3xl border border-white-60 bg-white-90 p-8 shadow-2x1 
backdrop-blur-sm">

                {/*Header*/}

                <div className="mb-7 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2x1 bg-gradient-to-br
 from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
                        🏠
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800">

                        Create Account

                    </h1>

                    <p className="mt-2 text-sm text-gray-500"> Join the Hostel Management System </p>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium
 text-red-700">

                        {error}

                    </div>
                )}

                {/*Success */}

                {message && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm 
font-medium text-green-700">
                        {message}

                    </div>
                )}

                {/*Name*/}

                <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        Full Name
                    </label>
                
                  <input
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition 
               focus border-blue-500 focusring-2 focusring-blue-100"
                        value={form.name}
                        onChange={change}
                    />
                  </div>

                {/*Email*/}

                <div className="mb-4"> 
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">

                    Email Address

                </label>

                    <div className="flex gap-2">

                        <input

                            name="email"

                            type="email"

                            required

                            disabled={verified}

                            placeholder="example@gmail.com"

                            className="min-w-0 flex-1 rounded-xl border

border-gray-300 bg-white px-4 py-3 outline-none-

transition focus: border-blue-500 focusring-2

focusring-blue-100 disabled.bg-gray-100"

                            value={form.email}

                            onChange={change}
                        />

                        {!verified && (

                            <button

                                type="button"

                                onClick={sendOtp}

                                disabled={otpLoading}
                                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 
disabled opacity-50">

                                {otpLoading ? "Sending..." : "Send OTP"} </button>
                        )}

                    </div>

                </div>

                {/*OTP*/}

                {otpSent && !verified && (

                    <div className="mb-4">

                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">

                            Email OTP

                        </label>

                        <div className="flex gap-2">

                            <input

                                type="text"

                                inputMode="numeric"

                                maxLength={6}

                                placeholder="Enter 6-digit OTP"

                                className="min-w-0 flex-1 rounded-xl border

border-gray-300 px-4 py-3 text-center tracking-widest outline-none focus border-blue-500 focus:ring-2

focus:ring-blue-100"

                                value={otp}

                                onChange={(e) =>

                                    setOtp(

                                        e.target.value

                                            .replace(/\D/g, "")

                                            .slice(0, 6)
                                    )} />

                            <button

                                type="button"

                                onClick={verifyOtp}

                                disabled={otpLoading}

                                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white

haver:bg-green-700 disabled:opacity-50">

                                {otpLoading ? "Checking..." : "Verify"}

                            </button>

                        </div>
                       </div>

               ) }

                        <button

                            type="button"

                            onClick={sendOtp}

                            disabled={otpLoading}

                            className="mt-2 text-sm font-semibold

text-blue-600 hover:text-blue-800">

                            Resend OTP

                        </button>

                    



{verified && (

                    <div
                        className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">

                        Email verified

                    </div>
                )}


                <div className="mb-4">

                    <label className="mb-1.5 block text-om

font-semibold text-gray-700">

                        Phone Number

                    </label>

                    <input

                        name="phone"

                        type="tel"

                        inputMode="numeric"

                        maxLength={11}

                        required

                        placeholder="98765 43210"

                        className="w-full rounded-x border

border-gray-300 bg-white px-4 py-3 outline-none transition focus border-blue-500 focus ring-2

focusring-blue-100"

                        value={form.phone}

                        onChange={change}
                    />

                    <p className="mt-1 text-xs text-gray-400"> Enter exactly 10 digits

                    </p>

                </div>

                {/* Password */}

                <div className='mb-4'>

                    <label className='mb-1.5 block text-sm

font-semibold text-gray-700'>

                        Password

                    </label>

                    <div className="relative">

                        <input

                            name="password"

                            type={showPassword ? "text" : "password"}

                            required

                            placeholder="Enter your password"

                            className="w-full rounded-xl border

border-gray-300 bg-white px-4 py-3 pr-16 outline-none transition focus.border-blue-500 focus ring-2

focusring-blue-100"

                            value={form.password}

                            onChange={change}
                        />

                        <button

                            type="button"

                            onClick={() =>

                                setShowPassword(!showPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600

hover text-blue-800">

                            {showPassword ? "Hide" : "Show"}

                        </button>

                    </div>

                </div>


                {/* <div className="mb-6">

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                        Role

                    </label>

                    <select

                        name="role"

                        className="w-full rounded-xl border

border-gray-300 bg-white px-4 py-3 outline-none transition focus border-blue-500 focusring-2

focusring-blue-100"

                        value={form.role}

                        onChange={change}>

                        <option value="Resident">Resident</option>

                        <option value="Staff">Staff</option>

                        <option value="Manager">Manager</option>

                        <option value="Admin">Admin</option>

                    </select>

                </div> */}



                <button

                    type="submit"

                    disabled={loading || !verified}

                    className="w-full rounded-xl xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 font-semibold text-white shadow-ig transition duration-200

hover-translate-y-0.5 hover from-blue-700

hover:to-indigo-700 hover shadow-xl active translate-y-0 disabled cursor-not-allowed

disabled.opacity-50">

                    {loading ? "Creating Account" : "Create Account"}

                </button>

                {!verified && (

                    <p className="mt-2 text-center text-xs text-gray-400">

                        Verify your email to enable account creation

                    </p>
                )}

                {/*Login*/}

                <p className="mt-6 text-center text-sm

text-gray-500">

                    Already registered?{""}

                    <Link

                        className="font-semibold text-blue-600

hover text-blue-800"

                        to="/login">

                        Login

                    </Link>

                </p>

            </form>

        </div>
    );
}
