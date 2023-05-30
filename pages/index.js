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
    serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function Home() {
    const [file, setFile] = useState("");

    const [per, setPerc] = useState(null);
    const [todos, setTodos] = useState({
        Nname: '',
        Nprice: '',
        Ndescription: ''
    });

    const { signOut, authUser, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !authUser) {
            router.push("/login");
        }
        if (!!authUser) {
            fetchTodos(authUser.uid);
        }
    }, [authUser, isLoading, router]);


    useEffect(() => {
        const uploadFile = () => {
            const name = new Date().getTime() + file.name;

            console.log(name);
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                    setPerc(progress);
                    switch (snapshot.state) {
                        case "paused":
                            console.log("Upload is paused");
                            break;
                        case "running":
                            console.log("Upload is running");
                            break;
                        default:
                            break;
                    }
                },
                (error) => {
                    console.log(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setTodos((prev) => ({ ...prev, img: downloadURL }));
                    });
                }
            );
        };
        file && uploadFile();
    }, [file]);

    console.log(todos)


    /**
     * @param {string} uid - The user ID to fetch todos for.
     * @return {void}
     */
    const fetchTodos = async (uid) => {
        try {
            const q = query(collection(db, "namkeen"), where("owner", "==", uid));
            const querySnapshot = await getDocs(q);

            let data = [];
            querySnapshot.forEach((todo) => {
                data.push({ ...todo.data(), id: todo.id });
            });

            setTodos(data);
        } catch (error) {
            console.error("An error occurred", error);
        }
    };


    const onKeyUp = (event) => {
        if (event?.key === "Enter" && todoInput?.length > 0) {
            addToDo();
        }
    };

    const inputEvent = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        setTodos({ ...todos, [name]: value });
    }



    const addToDo = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "namkeen"), {
                ...todos,
                timeStamp: serverTimestamp(),
            });

            fetchTodos(authUser.uid);

            setTodos({ Nname: '', Nprice: '', Ndescription: '', Nimage: '' });
        } catch (error) {
            console.error("An error occured", error);
        }
    };

    const deleteTodo = async (docId) => {
        try {
            await deleteDoc(doc(db, "todos", docId));
            fetchTodos(authUser.uid);
        } catch (error) {
            console.error("An error occured", error);
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
                    <div className="flex justify-center flex-col items-center">
                        <span className="text-7xl mb-10">📝</span>
                        <h1 className="text-5xl md:text-7xl font-bold">
                            ToooDooo's
                        </h1>
                    </div>
                    <form className="flex items-center flex-col w-full gap-2 mt-10" onSubmit={addToDo}>
                        <input
                            placeholder={`👋 Hello ${authUser.username}, What to do Today?`}
                            type="text"
                            className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                            autoFocus
                            value={todos.Nname}
                            onChange={inputEvent}
                            onKeyUp={(e) => onKeyUp(e)}
                            name="Nname"
                        />
                        <input
                            placeholder={`👋 Hello ${authUser.username}, What to do Today?`}
                            type="text"
                            className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                            autoFocus
                            value={todos.Nprice}
                            onChange={inputEvent}
                            onKeyUp={(e) => onKeyUp(e)}
                            name="Nprice"
                        />
                        <input
                            placeholder={`👋 Hello ${authUser.username}, What to do Today?`}
                            type="text"
                            className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                            autoFocus
                            value={todos.Ndescription}
                            onChange={inputEvent}
                            onKeyUp={(e) => onKeyUp(e)}
                            name="Ndescription"
                        />
                        <input
                            placeholder={`👋 Hello ${authUser.username}, What to do Today?`}
                            type="file"
                            className="font-semibold placeholder:text-gray-500 border-[2px] border-black h-[60px] grow shadow-sm rounded-md px-4 focus-visible:outline-yellow-400 text-lg transition-all duration-300"
                            autoFocus
                            value={todos.Nimage}
                            onChange={(e) => setFile(e.target.files[0])}
                            onKeyUp={(e) => onKeyUp(e)}
                        />
                        <button
                            className="w-[300px] h-[60px] rounded-md bg-black flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-black/[0.8]"
                            type="submit"
                        >
                            <AiOutlinePlus size={30} color="#fff" /> &nbsp; <p className="text-white font-semibold">Add Namkeen</p>
                        </button>
                    </form>
                </div>
                <div className="my-10">
                    {todos.length > 0 &&
                        todos.map((todo) => (
                            <div key={todo.id} className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        id={`todo-${todo.id}`}
                                        type="checkbox"
                                        className="w-4 h-4 accent-green-400 rounded-lg"
                                        checked={todo.completed}
                                        onChange={(e) => makeAsCompleteHandler(e, todo.id)}
                                    />
                                    <span>{todo?.id.Nname}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MdDeleteForever
                                        size={24}
                                        className="text-red-400 hover:text-red-600 cursor-pointer"
                                        onClick={() => deleteTodo(todo.id)}
                                    />
                                </div>
                            </div>
                        ))}

                    {todos.length < 1 && (
                        <span className="text-center w-full block text-2xl font-medium text-gray-400 mt-28">{`🥹 You don't have todo's`}</span>
                    )}
                </div>
            </div>
        </main>
    );
}
