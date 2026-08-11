import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("Medium");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const response = await api.get("/tasks");
            setTasks(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setError("Görevler getirilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();

        try {
            await api.post("/tasks", {
                title,
                description,
                completed: false,
                priority
            });

            setTitle("");
            setDescription("");
            setPriority("Medium");
            setError("");

            fetchTasks();
        } catch (error) {
            setError("Görev eklenirken bir hata oluştu.");
        }
    };

    const handleCompleteTask = async (task) => {
        try {
            await api.put(`/tasks/${task.Id}`, {
                title: task.Title,
                description: task.Description,
                completed: !task.Completed,
                priority: task.Priority,
                dueDate: task.DueDate || null
            });

            setError("");
            fetchTasks();
        } catch (error) {
            setError("Görev güncellenirken bir hata oluştu.");
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setError("");
            fetchTasks();
        } catch (error) {
            setError("Görev silinirken bir hata oluştu.");
        }
    };

    const startEditing = (task) => {
        setEditingId(task.Id);
        setEditTitle(task.Title);
        setEditDescription(task.Description || "");
        setEditPriority(task.Priority || "Medium");
    };

    const handleUpdateTask = async (task) => {
        try {
            await api.put(`/tasks/${task.Id}`, {
                title: editTitle,
                description: editDescription,
                completed: task.Completed,
                priority: editPriority,
                dueDate: task.DueDate || null
            });

            setEditingId(null);
            setError("");

            fetchTasks();
        } catch (error) {
            setError("Görev düzenlenirken bir hata oluştu.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const totalTasks = tasks.length;

    const pendingTasks = tasks.filter(
        (task) => !task.Completed
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.Completed
    ).length;

    const filteredTasks = tasks.filter((task) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            task.Title.toLowerCase().includes(searchText) ||
            (task.Description || "")
                .toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "pending" && !task.Completed) ||
            (statusFilter === "completed" && task.Completed);

        const matchesPriority =
            priorityFilter === "all" ||
            task.Priority === priorityFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );
    });

    if (loading) {
        return (
            <div className="loading-screen">
                Görevler yükleniyor...
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="header-label">
                        TASK MANAGEMENT
                    </p>

                    <h1>Görevlerim</h1>

                    <p className="header-description">
                        Günlük görevlerini oluştur, takip et ve tamamla.
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Çıkış Yap
                </button>
            </header>

            <main className="dashboard-content">

                <section className="stats-grid">
                    <div className="stat-card">
                        <span>Toplam</span>
                        <strong>{totalTasks}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Bekleyen</span>
                        <strong>{pendingTasks}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Tamamlanan</span>
                        <strong>{completedTasks}</strong>
                    </div>
                </section>

                <section className="add-task-card">
                    <div className="section-heading">
                        <h2>Yeni Görev</h2>
                        <p>
                            Yapman gereken yeni bir görev ekle.
                        </p>
                    </div>

                    <form
                        className="task-form"
                        onSubmit={handleAddTask}
                    >
                        <input
                            type="text"
                            placeholder="Görev başlığı"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            required
                        />

                        <input
                            type="text"
                            placeholder="Açıklama"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                        />

                        <select
                            value={priority}
                            onChange={(e) =>
                                setPriority(e.target.value)
                            }
                        >
                            <option value="Low">
                                Düşük
                            </option>

                            <option value="Medium">
                                Orta
                            </option>

                            <option value="High">
                                Yüksek
                            </option>
                        </select>

                        <button
                            className="primary-button"
                            type="submit"
                        >
                            Görev Ekle
                        </button>
                    </form>
                </section>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <section className="tasks-section">
                    <div className="section-heading">
                        <h2>Görev Listesi</h2>

                        <p>
                            {filteredTasks.length} görev gösteriliyor.
                        </p>
                    </div>

                    <div className="filter-bar">
                        <input
                            type="text"
                            placeholder="Görev ara..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="all">
                                Tüm Durumlar
                            </option>

                            <option value="pending">
                                Bekleyen
                            </option>

                            <option value="completed">
                                Tamamlanan
                            </option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(e.target.value)
                            }
                        >
                            <option value="all">
                                Tüm Öncelikler
                            </option>

                            <option value="Low">
                                Düşük
                            </option>

                            <option value="Medium">
                                Orta
                            </option>

                            <option value="High">
                                Yüksek
                            </option>
                        </select>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="empty-state">
                            <h3>Görev bulunamadı</h3>

                            <p>
                                Filtreleri değiştir veya yeni görev ekle.
                            </p>
                        </div>
                    ) : (
                        <div className="task-grid">
                            {filteredTasks.map((task) => (
                                <article
                                    className={`task-card ${
                                        task.Completed
                                            ? "completed-task"
                                            : ""
                                    }`}
                                    key={task.Id}
                                >
                                    {editingId === task.Id ? (
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) =>
                                                    setEditTitle(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) =>
                                                    setEditDescription(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <select
                                                value={editPriority}
                                                onChange={(e) =>
                                                    setEditPriority(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Low">
                                                    Düşük
                                                </option>

                                                <option value="Medium">
                                                    Orta
                                                </option>

                                                <option value="High">
                                                    Yüksek
                                                </option>
                                            </select>

                                            <div className="task-actions">
                                                <button
                                                    className="save-button"
                                                    onClick={() =>
                                                        handleUpdateTask(
                                                            task
                                                        )
                                                    }
                                                >
                                                    Kaydet
                                                </button>

                                                <button
                                                    className="cancel-button"
                                                    onClick={() =>
                                                        setEditingId(
                                                            null
                                                        )
                                                    }
                                                >
                                                    İptal
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="task-card-top">
                                                <span
                                                    className={`priority-badge priority-${task.Priority.toLowerCase()}`}
                                                >
                                                    {task.Priority === "High"
                                                        ? "Yüksek"
                                                        : task.Priority === "Medium"
                                                        ? "Orta"
                                                        : "Düşük"}
                                                </span>

                                                <span
                                                    className={`status-badge ${
                                                        task.Completed
                                                            ? "status-completed"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    {task.Completed
                                                        ? "Tamamlandı"
                                                        : "Bekliyor"}
                                                </span>
                                            </div>

                                            <h3>
                                                {task.Title}
                                            </h3>

                                            <p className="task-description">
                                                {task.Description ||
                                                    "Açıklama eklenmemiş."}
                                            </p>

                                            {task.DueDate && (
                                                <p className="due-date">
                                                    Son tarih:{" "}
                                                    {new Date(
                                                        task.DueDate
                                                    ).toLocaleDateString(
                                                        "tr-TR"
                                                    )}
                                                </p>
                                            )}

                                            <div className="task-actions">
                                                <button
                                                    className="complete-button"
                                                    onClick={() =>
                                                        handleCompleteTask(
                                                            task
                                                        )
                                                    }
                                                >
                                                    {task.Completed
                                                        ? "Geri Al"
                                                        : "Tamamla"}
                                                </button>

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        startEditing(
                                                            task
                                                        )
                                                    }
                                                >
                                                    Düzenle
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDeleteTask(
                                                            task.Id
                                                        )
                                                    }
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;