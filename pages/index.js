import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { GoSignOut } from "react-icons/go";
import { useAuth } from "@/firebase/auth";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import {
    collection,
    addDoc,
    getDocs,
    where,
    query,
    deleteDoc,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import NamkeenList from '@/components/NamkeenList'
import Image from 'next/image';


export default function Home() {
    const [itemName, setItemName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [namkeen, setNamkeen] = useState([]);
    const [file, setFile] = useState(""); // Added file state

    const { signOut, authUser, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("/login");
        }
        if (!!authUser) {
            fetchNamkeen(authUser.uid);
        }
    }, [authUser, isLoading]);

    useEffect(() => {
        const uploadFile = () => {
            const name = new Date().getTime() + file.name;
            const storageRef = ref(storage, file.name);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                        default:
                            break;
                    }
                },
                (error) => {
                    console.log(error)
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setNamkeen((prev) => ({ ...prev, img: downloadURL }));
                    });
                }
            );
        }
        file && uploadFile()
    }, [file])

    const fetchNamkeen = async (uid) => {
        try {
            const q = query(collection(db, "namkeen"), where("owner", "==", uid));
            const querySnapshot = await getDocs(q);

            let data = [];
            querySnapshot.forEach((namkeen) => {
                data.push({ ...namkeen.data(), id: namkeen.id });
            });

            setNamkeen(data);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    const addNamkeen = async () => {
        try {
            const docRef = await addDoc(collection(db, "namkeen"), {
                owner: authUser.uid,
                itemName: itemName,
                description: description,
                price: price,
                quantity: quantity,
                imageUrl: "", // Initialize imageUrl as an empty string
                completed: false,
            });

            if (file) {
                // Upload the image if a file is selected
                const storageRef = ref(storage, `${file.name + new Date()}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        // Handle progress or monitoring the upload process, if needed
                    },
                    (error) => {
                        console.error("An error occurred while uploading the image", error);
                    },
                    () => {
                        // Upload complete, get the download URL
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            // Update the imageUrl in the Firestore document
                            updateImageUrl(docRef.id, downloadURL);
                        });
                    }
                );
            }

            fetchNamkeen(authUser.uid);

            // Clear the input fields and file state
            setItemName("");
            setDescription("");
            setPrice("");
            setQuantity("");
            setFile(null);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    const deleteNamkeen = async (docId) => {
        try {
            await deleteDoc(doc(db, "namkeen", docId));
            fetchNamkeen(authUser.uid);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    const updateImageUrl = async (docId, imageUrl) => {
        try {
            await updateDoc(doc(db, "namkeen", docId), {
                imageUrl: imageUrl,
            });
        } catch (error) {
            console.error("An error occurred", error);
        }
    };

    return !authUser ? (
        <Loader />
    ) : (
        <main className="">
            <div
                className="bg-black text-white w-44 py-4 mt-10 rounded-lg transition-transform hover:bg-black/[0.8] active:scale-90 flex items-center justify-center gap-2 font-medium shadow-md fixed bottom-5 right-5 cursor-pointer"
                onClick={signOut}
            >
                <GoSignOut size={18} />
                <span>Logout</span>
            </div>
            <div className="max-w-3xl mx-auto mt-10 p-8">
                <div className="bg-white -m-6 p-3 sticky top-0">
                    <div className="flex justify-center items-center">
                        <Image
                            src="/nachos.png"
                            alt="Namkeen Image"
                            width={40}
                            height={40}
                        />
                        <h1 className="pl-5 mt-2 text-3xl md:text-3xl font-bold">
                            Namkeen
                        </h1>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-10">
                        <div className="flex items-center gap-2 mt-10">
                            <input
                                placeholder={`Name`}
                                type="text"
                                className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                                autoFocus
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />

                            <div className="flex w-[300px] h-[60px] items-center justify-center bg-grey-lighter grow shadow-sm rounded-md cursor-pointer">
                                <label className="font-semibold w-[40px] flex justify-center gap-2 items-center placeholder:text-gray-500 border-[2px] border-black  cursor-pointer h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300">
                                    <svg className="w-[40px] h-[40px]  cursor-pointer" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                                    </svg>
                                    <span className="mt-1 font-semibold text-base leading-normal">Select a file</span>
                                    <input
                                        type='file'
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </label>
                            </div>

                        </div>
                        <div className="flex items-center gap-2 mt-5">
                            <input
                                placeholder="Price"
                                type="text"
                                className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <input
                                placeholder="Quantity"
                                type="text"
                                className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <textarea
                            placeholder="Description"
                            type="text"
                            className="font-semibold w-5/6 placeholder:text-gray-500 border-[2px] border-black h-28 mt-5 grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <button
                            className="w-[250px] h-[60px] rounded-md bg-black flex mt-10 justify-center items-center cursor-pointer transition-all duration-300 hover:bg-black/[0.8]"
                            onClick={addNamkeen}
                        >
                            <AiOutlinePlus size={30} color="#fff" />
                            <span className="pl-2 text-white font-semibold text-base leading-normal">Add Namkeen</span>

                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-5xl mx-auto mt-10 p-8">
                <div className="mt-10 absolute w-1/2">
                    {namkeen.length > 0 ? (
                        <table className="w-full border-collapse text-center">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2">Image</th>
                                    <th className="border p-2">Item Name</th>
                                    <th className="border p-2">Description</th>
                                    <th className="border p-2">Price</th>
                                    <th className="border p-2">Quantity</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {namkeen.map((item) => (
                                    <NamkeenList key={item.id} item={item} deleteNamkeen={deleteNamkeen} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="pl-5 mt-2 text-3xl md:text-3xl font-bold w-full text-center">No namkeen items found.</p>
                    )}
                </div>
            </div>
        </main>
    );
}