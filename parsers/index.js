import POSBParser from "./POSBParser";
import UOBParser from "./UOBParser";
import TimeForMeToStudyParser from "./TimeForMeToStudyParser";

const registry = [POSBParser, UOBParser, TimeForMeToStudyParser];

export const registerParser = (parser) => {
    if (!registry.some((item) => item.id === parser.id)) {
        registry.push(parser);
    }
};

export const getParsers = () => [...registry];

export const parseEmail = (email) => {
    for (const parser of registry) {
        try {
            if (parser.match(email)) {
                return parser.parse(email);
            }
        } catch (error) {
            console.warn(`Parser ${parser.id} failed`, error);
        }
    }
    return null;
};

export const getParserBySender = (sender) =>
    registry.find((parser) =>
        sender ? sender.toLowerCase().includes(parser.supportedSender ?? "") : false
    );
