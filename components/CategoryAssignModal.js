import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from "react-native";
import { COLORS } from "../config";

const CategoryAssignModal = ({ visible, categories, onClose, onSelect }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Assign Category</Text>
                    {categories.length ? (
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id?.toString() ?? item.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => onSelect(item)}
                                >
                                    <Text style={styles.itemText}>{item.name}</Text>
                                    <Text style={styles.itemMeta}>
                                        Budget: SGD {Number(item.monthly_budget || 0).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <Text style={styles.empty}>No categories yet. Create one in Budgets.</Text>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    container: {
        width: "100%",
        maxHeight: "80%",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    itemText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    itemMeta: {
        color: COLORS.subText,
        fontSize: 12,
        marginTop: 2,
    },
    empty: {
        color: COLORS.subText,
        textAlign: "center",
        marginBottom: 16,
    },
    closeButton: {
        marginTop: 16,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
    },
    closeText: {
        color: COLORS.accent,
        fontWeight: "600",
    },
});

export default CategoryAssignModal;
