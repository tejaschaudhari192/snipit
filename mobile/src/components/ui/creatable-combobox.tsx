import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import { Folder as FolderIcon, Plus, Check, Search, X, ChevronDown } from "lucide-react-native";
import { Input } from "./input";
import { Button } from "./button";
import { Text } from "./text";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    id: string;
    label: string;
    color?: string;
}

export interface CreatableComboboxProps {
    options: ComboboxOption[];
    selectedId?: string;
    onSelect: (id: string | undefined) => void;
    onCreate?: (name: string, color?: string) => Promise<ComboboxOption | void>;
    placeholder?: string;
    emptyText?: string;
    allowNone?: boolean;
    noneLabel?: string;
    className?: string;
    createLabel?: string;
    title?: string;
    triggerRender?: (props: {
        selectedOption?: ComboboxOption;
        open: () => void;
    }) => React.ReactNode;
}

const PRESET_COLORS = ["#09090b", "#71717a", "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

export function CreatableCombobox({
    options,
    selectedId,
    onSelect,
    onCreate,
    placeholder = "Select option...",
    emptyText = "No matching items found.",
    allowNone = true,
    noneLabel = "None (Root)",
    className = "",
    createLabel = "Create new",
    title = "Select Folder",
    triggerRender,
}: CreatableComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newColor, setNewColor] = useState(PRESET_COLORS[2]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedOption = useMemo(
        () => options.find((opt) => opt.id === selectedId),
        [options, selectedId]
    );

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchQuery]);

    const canQuickCreate = Boolean(
        onCreate &&
        searchQuery.trim().length > 0 &&
        !options.some((o) => o.label.toLowerCase() === searchQuery.toLowerCase().trim())
    );

    const handleCreateNew = async () => {
        const titleToCreate = newTitle.trim() || searchQuery.trim();
        if (!titleToCreate || !onCreate || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const created = await onCreate(titleToCreate, newColor);
            if (created && created.id) {
                onSelect(created.id);
            }
            setNewTitle("");
            setIsCreating(false);
            setSearchQuery("");
            setIsOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openModal = () => {
        setIsOpen(true);
        setSearchQuery("");
        setIsCreating(false);
    };

    return (
        <View className={cn(!triggerRender && "w-full", className)}>
            {/* Trigger Button */}
            {triggerRender ? (
                triggerRender({ selectedOption, open: openModal })
            ) : (
                <TouchableOpacity
                    className="flex-row items-center justify-between px-3 py-2.5 rounded-md border border-input bg-background"
                    onPress={openModal}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center gap-2 flex-1 mr-2">
                        {selectedOption ? (
                            <>
                                <View
                                    style={{ backgroundColor: selectedOption.color || "#3b82f6" }}
                                    className="w-2.5 h-2.5 rounded-full"
                                />
                                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                                    {selectedOption.label}
                                </Text>
                            </>
                        ) : (
                            <>
                                <FolderIcon className="text-muted-foreground" size={14} />
                                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                                    {placeholder}
                                </Text>
                            </>
                        )}
                    </View>
                    <ChevronDown className="text-muted-foreground" size={18} />
                </TouchableOpacity>
            )}

            {/* Modal Dialog for searchable & creatable options */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center p-4"
                    onPress={() => setIsOpen(false)}
                >
                    <Pressable
                        className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 shadow-2xl"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header & Search Bar */}
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold text-foreground">{title}</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)} hitSlop={12}>
                                <X className="text-muted-foreground" size={18} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View className="flex-row items-center bg-muted/60 border border-input rounded-lg px-2.5 mb-2.5">
                            <Search className="text-muted-foreground" size={15} />
                            <Input
                                placeholder="Search or type to create..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="flex-1 border-0 bg-transparent h-9 text-sm px-2"
                                autoFocus={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <X className="text-muted-foreground" size={14} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Inline Creator Drawer */}
                        {isCreating ? (
                            <View className="p-3 mb-2 rounded-xl border border-border bg-muted/40">
                                <Text className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                                    New Folder Name
                                </Text>
                                <Input
                                    placeholder="Folder title..."
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                    className="h-9 mb-2 bg-background"
                                    autoFocus
                                />
                                <View className="flex-row items-center justify-between pt-1">
                                    <View className="flex-row items-center gap-1.5">
                                        {PRESET_COLORS.map((col) => (
                                            <TouchableOpacity
                                                key={col}
                                                onPress={() => setNewColor(col)}
                                                className={cn(
                                                    "w-5 h-5 rounded-full border",
                                                    newColor === col ? "border-foreground scale-110" : "border-border"
                                                )}
                                                style={{ backgroundColor: col }}
                                            />
                                        ))}
                                    </View>
                                    <View className="flex-row items-center gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2"
                                            onPress={() => {
                                                setIsCreating(false);
                                                setNewTitle("");
                                            }}
                                        >
                                            <Text className="text-xs">Cancel</Text>
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-7 px-2.5"
                                            disabled={!newTitle.trim() || isSubmitting}
                                            onPress={handleCreateNew}
                                        >
                                            <Text className="text-xs font-semibold text-primary-foreground">
                                                {isSubmitting ? "Creating..." : "Create"}
                                            </Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {/* List of Options */}
                        <ScrollView
                            className="max-h-60"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Allow Root / None Option */}
                            {allowNone && !searchQuery.trim() && (
                                <TouchableOpacity
                                    className={cn(
                                        "flex-row items-center justify-between px-3 py-2.5 rounded-lg mb-1",
                                        selectedId === undefined ? "bg-muted" : "active:bg-muted/50"
                                    )}
                                    onPress={() => {
                                        onSelect(undefined);
                                        setIsOpen(false);
                                    }}
                                >
                                    <View className="flex-row items-center gap-2.5">
                                        <View className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                                        <Text className="text-sm font-medium text-foreground">{noneLabel}</Text>
                                    </View>
                                    {selectedId === undefined && <Check className="text-foreground" size={16} />}
                                </TouchableOpacity>
                            )}

                            {filteredOptions.map((opt) => {
                                const isSelected = opt.id === selectedId;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        className={cn(
                                            "flex-row items-center justify-between px-3 py-2.5 rounded-lg mb-1",
                                            isSelected ? "bg-muted" : "active:bg-muted/50"
                                        )}
                                        onPress={() => {
                                            onSelect(opt.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: opt.color || "#3b82f6" }}
                                            />
                                            <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                                                {opt.label}
                                            </Text>
                                        </View>
                                        {isSelected && <Check className="text-foreground" size={16} />}
                                    </TouchableOpacity>
                                );
                            })}

                            {filteredOptions.length === 0 && !canQuickCreate && (
                                <View className="py-6 items-center justify-center">
                                    <Text className="text-xs text-muted-foreground">{emptyText}</Text>
                                </View>
                            )}

                            {/* Quick Create Prompt button when typed something not found */}
                            {canQuickCreate && !isCreating && (
                                <TouchableOpacity
                                    className="flex-row items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 mt-1"
                                    onPress={() => {
                                        setNewTitle(searchQuery.trim());
                                        setIsCreating(true);
                                    }}
                                >
                                    <Plus className="text-primary" size={16} />
                                    <Text className="text-sm font-semibold text-primary">
                                        {createLabel} &quot;{searchQuery.trim()}&quot;
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        {/* Bottom Bar: Add custom folder button */}
                        {onCreate && !isCreating && !canQuickCreate && (
                            <View className="pt-2 mt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex-row items-center justify-center gap-1.5 h-9"
                                    onPress={() => {
                                        setNewTitle("");
                                        setIsCreating(true);
                                    }}
                                >
                                    <Plus className="text-foreground" size={14} />
                                    <Text className="text-xs font-semibold">New Folder</Text>
                                </Button>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
