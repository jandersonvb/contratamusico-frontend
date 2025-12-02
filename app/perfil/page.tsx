"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { Star, MapPin, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { musicianDetails } from "@/lib/musicianDetails";

/**
 * Profile page that allows the logged in musician to view and edit their
 * personal and musical information. It also shows a summary card with
 * statistics and provides navigation between different sections. The
 * editing states for each tab are controlled independently and can
 * toggle between read‑only and editable modes.
 */
export default function PerfilPage() {
  // Assume the logged in musician is the first entry in our sample data
  const user = musicianDetails[0];

  // Tabs state
  const [activeTab, setActiveTab] = useState<
    | "info-pessoais"
    | "info-musicais"
    | "portfolio"
    | "avaliacoes"
    | "configuracoes"
  >("info-pessoais");

  // Editing states
  const [editPersonal, setEditPersonal] = useState(false);
  const [editMusical, setEditMusical] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: user.name.split(" ")[0] || "",
    lastName: user.name.split(" ")[1] || "",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-05-15",
    city: user.location.split(",")[0] || "",
    state: user.location.split(",")[1]?.trim() || "",
    bio: user.about.join("\n\n"),
  });

  const [musicalForm, setMusicalForm] = useState({
    instruments: user.instruments,
    genres: user.tags,
    experience: user.experience,
    priceRange: "300-500",
    equipment: user.equipment,
  });

  // Options for selects and checkboxes
  const instrumentOptions = [
    "Violão",
    "Guitarra",
    "Vocal",
    "Piano",
    "Bateria",
    "Sax",
  ];
  const genreOptions = ["MPB", "Bossa Nova", "Pop", "Rock", "Jazz", "Samba"];
  const experienceOptions = [
    { value: "iniciante", label: "Iniciante (0-2 anos)" },
    { value: "intermediario", label: "Intermediário (2-5 anos)" },
    { value: "profissional", label: "Profissional (5+ anos)" },
  ];
  const priceOptions = [
    { value: "0-300", label: "Até R$ 300" },
    { value: "300-500", label: "R$ 300 - R$ 500" },
    { value: "500-800", label: "R$ 500 - R$ 800" },
    { value: "800+", label: "Mais de R$ 800" },
  ];

  const handlePersonalChange = (
    field: keyof typeof personalForm,
    value: string
  ) => {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMusicalCheckbox = (
    field: "instruments" | "genres",
    option: string,
    checked: boolean
  ) => {
    setMusicalForm((prev) => {
      const arr = new Set(prev[field]);
      if (checked) arr.add(option);
      else arr.delete(option);
      return { ...prev, [field]: Array.from(arr) };
    });
  };

  const handleMusicalChange = (
    field: keyof typeof musicalForm,
    value: string
  ) => {
    setMusicalForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Informações pessoais atualizadas!");
    setEditPersonal(false);
  };

  const saveMusicalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Informações musicais atualizadas!");
    setEditMusical(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Profile card */}
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="relative inline-block mb-4">
                <Image
                  src={
                    user.portfolio[0]?.image ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                  }
                  alt={user.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover h-24 w-24"
                />
                <button
                  type="button"
                  aria-label="Alterar foto de perfil"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-card border shadow text-muted-foreground hover:text-primary"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">
                {user.category}
              </p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(user.rating)
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                    fill={i < Math.round(user.rating) ? "currentColor" : "none"}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {user.rating.toFixed(1)} ({user.ratingCount})
                </span>
              </div>
              <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" /> {user.location}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                  <div className="font-semibold">{user.events}</div>
                  <div className="text-xs text-muted-foreground">Eventos</div>
                </div>
                <div>
                  <div className="font-semibold">{user.satisfaction}%</div>
                  <div className="text-xs text-muted-foreground">
                    Satisfação
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{user.responseTime}</div>
                  <div className="text-xs text-muted-foreground">
                    Resp. Média
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href={`/musico/${user.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  rel="noopener noreferrer"
                >
                  Ver Perfil Público
                </a>
              </div>
            </div>
            {/* Navigation menu */}
            <nav className="flex flex-col space-y-2">
              {[
                { id: "info-pessoais", label: "Informações Pessoais" },
                { id: "info-musicais", label: "Informações Musicais" },
                { id: "portfolio", label: "Portfólio" },
                { id: "avaliacoes", label: "Avaliações" },
                { id: "configuracoes", label: "Configurações" },
              ].map((item) => (
                <button
                  key={item.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          {/* Content area */}
          <main className="space-y-8">
            {/* Personal Info Tab */}
            {activeTab === "info-pessoais" && (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Informações Pessoais
                  </h3>
                  {!editPersonal ? (
                    <Button size="sm" onClick={() => setEditPersonal(true)}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={savePersonalInfo}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditPersonal(false);
                          // Reset form values to original when canceling
                          setPersonalForm({
                            firstName: user.name.split(" ")[0] || "",
                            lastName: user.name.split(" ")[1] || "",
                            email: personalForm.email,
                            phone: personalForm.phone,
                            birthDate: personalForm.birthDate,
                            city: user.location.split(",")[0] || "",
                            state: user.location.split(",")[1]?.trim() || "",
                            bio: user.about.join("\n\n"),
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <form onSubmit={savePersonalInfo} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        Nome
                      </label>
                      <Input
                        id="firstName"
                        value={personalForm.firstName}
                        onChange={(e) =>
                          handlePersonalChange("firstName", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Sobrenome
                      </label>
                      <Input
                        id="lastName"
                        value={personalForm.lastName}
                        onChange={(e) =>
                          handlePersonalChange("lastName", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium">
                      E‑mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={personalForm.email}
                      onChange={(e) =>
                        handlePersonalChange("email", e.target.value)
                      }
                      readOnly={!editPersonal}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <Input
                        id="phone"
                        value={personalForm.phone}
                        onChange={(e) =>
                          handlePersonalChange("phone", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="birthDate"
                        className="text-sm font-medium"
                      >
                        Data de Nascimento
                      </label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={personalForm.birthDate}
                        onChange={(e) =>
                          handlePersonalChange("birthDate", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="city" className="text-sm font-medium">
                        Cidade
                      </label>
                      <Input
                        id="city"
                        value={personalForm.city}
                        onChange={(e) =>
                          handlePersonalChange("city", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="state" className="text-sm font-medium">
                        Estado
                      </label>
                      <Input
                        id="state"
                        value={personalForm.state}
                        onChange={(e) =>
                          handlePersonalChange("state", e.target.value)
                        }
                        readOnly={!editPersonal}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Biografia
                    </label>
                    <Textarea
                      id="bio"
                      value={personalForm.bio}
                      onChange={(e) =>
                        handlePersonalChange("bio", e.target.value)
                      }
                      readOnly={!editPersonal}
                      rows={5}
                    />
                  </div>
                </form>
              </div>
            )}
            {/* Musical Info Tab */}
            {activeTab === "info-musicais" && (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Informações Musicais
                  </h3>
                  {!editMusical ? (
                    <Button size="sm" onClick={() => setEditMusical(true)}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveMusicalInfo}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditMusical(false);
                          setMusicalForm({
                            instruments: user.instruments,
                            genres: user.tags,
                            experience: user.experience,
                            priceRange: "300-500",
                            equipment: user.equipment,
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <form onSubmit={saveMusicalInfo} className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Instrumentos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {instrumentOptions.map((option) => {
                        const checked =
                          musicalForm.instruments.includes(option);
                        return (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handleMusicalCheckbox(
                                  "instruments",
                                  option,
                                  !!val
                                )
                              }
                              disabled={!editMusical}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Estilos Musicais</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {genreOptions.map((option) => {
                        const checked = musicalForm.genres.includes(option);
                        return (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                handleMusicalCheckbox("genres", option, !!val)
                              }
                              disabled={!editMusical}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="experience"
                        className="text-sm font-medium"
                      >
                        Experiência
                      </label>
                      <Select
                        value={musicalForm.experience}
                        onValueChange={(value) =>
                          handleMusicalChange("experience", value)
                        }
                        disabled={!editMusical}
                      >
                        <SelectTrigger id="experience" className="w-full">
                          {experienceOptions.find(
                            (o) => o.value === musicalForm.experience
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="priceRange"
                        className="text-sm font-medium"
                      >
                        Faixa de Preço
                      </label>
                      <Select
                        value={musicalForm.priceRange}
                        onValueChange={(value) =>
                          handleMusicalChange("priceRange", value)
                        }
                        disabled={!editMusical}
                      >
                        <SelectTrigger id="priceRange" className="w-full">
                          {priceOptions.find(
                            (o) => o.value === musicalForm.priceRange
                          )?.label || "Selecione"}
                        </SelectTrigger>
                        <SelectContent>
                          {priceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="equipment" className="text-sm font-medium">
                      Equipamentos Próprios
                    </label>
                    <Textarea
                      id="equipment"
                      value={musicalForm.equipment}
                      onChange={(e) =>
                        handleMusicalChange("equipment", e.target.value)
                      }
                      readOnly={!editMusical}
                      rows={4}
                    />
                  </div>
                </form>
              </div>
            )}
            {/* Placeholder for other tabs */}
            {activeTab === "portfolio" && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Portfólio</h3>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá gerenciar seu portfólio aqui.
                </p>
              </div>
            )}
            {activeTab === "avaliacoes" && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Avaliações</h3>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá ver as avaliações que recebeu.
                </p>
              </div>
            )}
            {activeTab === "configuracoes" && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                <p className="text-sm text-muted-foreground">
                  Ajustes de conta e preferências estarão disponíveis aqui em
                  breve.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
